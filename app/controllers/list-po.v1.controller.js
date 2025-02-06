const {
  list_pos,
  list_po_items,
  products,
  product_barcodes,
  suppliers,
} = require('../../models')
const db = require('../../models')
const cache = require('memory-cache')
const { Op, fn, col, where, literal } = require('sequelize')
const formatPoNumber = require('../utils/po-number')
const romawi = require('../utils/month-romawi')
const { ValidationError } = require('sequelize')
const { transporter } = require('../utils/transporter')
const today = require('../utils/today')
const { sendWhatsappNotification } = require('../utils/twilio')
const { logger } = require('../utils/logger')
const { approveNotification } = require('../utils/approve-po-twilio')
const { AsyncHandler, TransactionHandler } = require('../utils/async-handler')
const { ErrorAppHandler } = require('../utils/error-handler')
const { ValidatePoItem } = require('../helpers/list-po-item.helpers')
const { ValidateCreatePo } = require('../helpers/list-po.helpers')
const SuccessHandler = require('../utils/success-handler')

// GENERATE NEW NO PO
const functionGenerateNoPo = async () => {
  try {
    const year = new Date().getFullYear()
    const latest_list_po = await list_pos.findAll({
      limit: 1,
      order: [[literal("CAST(SPLIT_PART(no_po, '/', 1) AS INTEGER)"), 'DESC']], // Sort by the numeric part
      where: {
        no_po: { [Op.ne]: null },
        [Op.and]: [
          where(
            literal("SPLIT_PART(no_po, '/', 5)"), // Extract year part
            year.toString()
          ),
        ],
      },
      attributes: ['no_po'],
    })

    const latest_no_po =
      Number(latest_list_po[0]?.dataValues?.no_po?.split('/')[0]) || 0
    const po_number = formatPoNumber(latest_no_po + 1)
    const month = romawi[new Date().getMonth()]
    const no_po = `${po_number}/PO/SS/${month}/${year}`
    return no_po
  } catch (error) {
    throw ErrorAppHandler('Failed to generate no po', 402)
  }
}

// ========================== HANDLE CREATE PO ==============================
exports.CreatePO = TransactionHandler(async (req, res, next, transaction) => {
  const validateData = ValidateCreatePo(req.body)
  const { name, supplier_id, prepared_by, note, no_po, data, reff_no } =
    validateData

  let existingPo = null

  // Logic to handle existing PO
  if (no_po) {
    existingPo = await list_pos.findOne({
      where: { no_po },
      transaction,
      lock: transaction.LOCK.UPDATE, // Menghindari race condition
    })

    if (existingPo) {
      await Promise.all([
        list_pos.update(
          { no_po_revised: no_po, canceled: 1 },
          { where: { no_po }, transaction }
        ),
        list_po_items.update(
          { approved: 0 },
          { where: { list_po_id: existingPo.id }, transaction }
        ),
      ])
    }
  }

  const newPO = await list_pos.create(
    {
      name,
      no_po,
      supplier_id,
      prepared_by,
      note,
      reff_no,
    },
    { transaction }
  )

  if (data?.length > 0) {
    const validatedPoItems = await Promise.all(
      data.map((item) => ValidatePoItem(item, newPO.id))
    )

    await list_po_items.bulkCreate(validatedPoItems, { transaction })
  }

  return SuccessHandler(res, 'Successfully created PO')
})

// ========================== HANDLE GET ALL NO PO ==============================
exports.GetAllNoPO = AsyncHandler(async (req, res) => {
  const data = await list_pos.findAll({
    where: {
      approved: 1,
      canceled: 0,
    },
    attributes: ['no_po'],
    order: [['no_po', 'DESC']],
  })
  return SuccessHandler(res, 'Successfully retrieved all list no po', data)
})

// ========================== HANDLE GET ALL PO ==============================
exports.GetAllPO = AsyncHandler(async (req, res) => {
  const data = await list_pos.findAll({
    where: {
      approved: 0,
      rejected: 0,
      canceled: 0,
    },
    include: [
      {
        model: list_po_items,
        as: 'list_po_items',
        include: [
          {
            model: products,
          },
        ],
      },
    ],
    order: [['id', 'DESC']],
  })
  return SuccessHandler(res, 'Successfully retrieved all list po', data)
})

// ========================== HANDLE DELETE PO ==============================
exports.DeletePO = AsyncHandler(async (req, res) => {
  const id = Number(req.params.id)

  if (isNaN(id) || id <= 0) {
    throw ErrorAppHandler('Invalid ID. Please provide a valid numeric ID.', 400)
  }

  const listPo = await list_pos.findOne({ where: { id } })
  if (!listPo) {
    throw ErrorAppHandler(`List PO with ID ${id} not found`)
  }

  await list_pos.destroy({ where: { id } })
  return SuccessHandler(res, 'Successfully delete List PO')
})

// ========================== HANDLE APPROVE ==============================
const sortItems = (data) => {
  const pendingItems = []
  const rejectItems = []
  const approveItems = []

  Object.entries(data).forEach(([itemId, status]) => {
    const item = { id: Number(itemId) }
    if (status === 0) pendingItems.push(item)
    else if (status === 1) rejectItems.push(item)
    else if (status === 2) approveItems.push(item)
  })

  return [pendingItems, rejectItems, approveItems]
}

const handlePendingItems = async (pendingItems, list_po, name, transaction) => {
  if (pendingItems.length === 0) return null

  const pendingListPo = await list_pos.create(
    {
      name: list_po.name,
      supplier_id: list_po.supplier_id,
      prepared_by: list_po.prepared_by,
      note: list_po.note,
      reff_no: list_po.reff_no,
    },
    { transaction }
  )

  // USED
  const pendingItemDetails = await list_po_items.findAll({
    where: { id: pendingItems.map((item) => item.id) },
    transaction,
  })

  await list_po_items.bulkCreate(
    pendingItemDetails.map((item) => ({
      list_po_id: pendingListPo.id,
      quantity: item.quantity,
      price: item.price,
      total_price: item.total_price,
      product_id: item.product_id,
    })),
    { transaction }
  )

  return pendingListPo
}

const handleRejectItems = async (rejectItems, list_po, transaction) => {
  if (rejectItems.length === 0) return null

  const rejectListPo = await list_pos.create(
    {
      name: list_po.name,
      prepared_by: list_po.prepared_by,
      rejected: 1,
      note: list_po.note,
    },
    { transaction }
  )

  const rejectItemDetails = await list_po_items.findAll({
    where: { id: rejectItems.map((item) => item.id) },
    transaction,
  })

  await list_po_items.bulkCreate(
    rejectItemDetails.map((item) => ({
      list_po_id: rejectListPo.id,
      quantity: item.quantity,
      total_price: item.total_price,
      price: item.price,
      product_id: item.product_id,
    })),
    { transaction }
  )

  return rejectListPo
}

const handleApproveItems = async (approveItems, transaction) => {
  if (approveItems.length === 0) return

  await list_po_items.update(
    { approved: 1 },
    {
      where: { id: approveItems.map((item) => item.id) },
      transaction,
    }
  )
}

// USED
const updateMainPO = async (id, thereIsApprove, no_po, transaction) => {
  if (thereIsApprove) {
    const newNoPo = no_po
      ? `${no_po.includes('(Revised)') ? no_po : `${no_po} (Revised)`}`
      : await functionGenerateNoPo()
    await list_pos.update(
      { approved: 1, no_po: newNoPo },
      {
        where: { id },
        transaction,
      }
    )
    // APPROVE NOTIFCATION TO YUNI
    // await approveNotification({ no_po: newNoPo })
  } else {
    await list_pos.destroy({
      where: { id },
      transaction,
    })
  }
}

exports.ApprovePO = TransactionHandler(async (req, res, next, transaction) => {
  const { id, name, no_po, data } = req.body

  const list_po = await list_pos.findByPk(id, { transaction })
  if (!list_po) {
    throw ErrorAppHandler('PO Not Found', 404)
  }

  const [pendingItems, rejectItems, approveItems] = sortItems(data)

  await Promise.all([
    handlePendingItems(pendingItems, list_po, name, transaction),
    handleRejectItems(rejectItems, list_po, transaction),
    handleApproveItems(approveItems, transaction),
  ])

  const thereIsApprove = approveItems.length > 0

  await updateMainPO(id, thereIsApprove, no_po, transaction)

  return SuccessHandler(res, 'Successfully processed List PO')
})

// ========================== HANDLE GET ALL APPROVED PO ==============================
exports.GetAllApprovedPO = AsyncHandler(async (req, res) => {
  const data = await list_pos.findAll({
    order: [
      [fn('RIGHT', fn('REPLACE', col('no_po'), ' (Revised)', ''), 4), 'DESC'],
      [
        fn('SUBSTRING', fn('REPLACE', col('no_po'), ' (Revised)', ''), 1, 4),
        'DESC',
      ],
    ],

    where: {
      approved: 1,
      canceled: 0,
    },

    include: [
      {
        model: list_po_items,
        as: 'list_po_items',
        where: {
          approved: 1,
        },
        required: false,
        include: [
          {
            model: products,
          },
        ],
      },
      {
        model: suppliers,
        attributes: ['name', 'email', 'phone_no', 'fax_no', 'address', 'pic'],
      },
    ],
  })
  return SuccessHandler(res, 'Successfully get all Approved PO', data)
})

// test
exports.sendPo = AsyncHandler(async (req, res) => {
  const { name, no_po, msg, cc, to, subject, bcc, id } = req.body

  return res.send({
    message: 'lol',
  })

  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Purchase Order</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e2e2;
        }
        .header {
          background-color: #4caf50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          letter-spacing: 1px;
        }
        .content {
          padding: 20px;
          line-height: 1.6;
        }
        .content p {
          margin: 0 0 10px;
        }
        .footer {
          text-align: center;
          color: #777777;
          font-size: 12px;
          margin-top: 20px;
          border-top: 1px solid #e2e2e2;
          padding-top: 10px;
        }
        .signature {
          font-style: italic;
          color: #555555;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Purchase Order</h1>
        </div>
        <div class="content">
          <p>Dear Supplier,</p>
          ${msg ? `<p>${msg}</p>` : ''}
          <p>Please find attached the purchase order (${no_po}) for your reference.</p>
          <p>Thank you for your cooperation. Please contact us if you have any questions.</p>
          <p class="signature">Best regards,</p>
          <p class="signature">PT Surya Selindo Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} PT Surya Selindo. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `

  const message = {
    from: `SURYA SELINDO <${process.env.EMAIL}>`,
    to: to.split('|'),
    cc: cc.split(',') || undefined,
    bcc: [bcc, process.env.EMAIL] || undefined,
    subject: subject || `Purchase Order ${no_po}`,
    text: `Please find the attached PO document (${no_po}).${
      msg ? ` Message: ${msg}` : ''
    }`,
    html: htmlTemplate,
    attachments: [
      {
        filename: `${no_po}.pdf`,
        content: req.file.buffer,
        contentType: 'application/pdf',
      },
    ],
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      Importance: 'high',
      'Return-Path': process.env.EMAIL, // Return-Path address
    },
    replyTo: process.env.EMAIL, // Reply-To address
  }

  // Send email
  const info = await transporter.sendMail(message)

  // Update database
  const [updatedRowsCount] = await list_pos.update(
    { sended: 1 },
    { where: { id } }
  )

  if (updatedRowsCount === 0) {
    throw ErrorAppHandler('No matching record found to update', 404)
  }

  return SuccessHandler(res, 'Successfully! PO has been sent')
})
