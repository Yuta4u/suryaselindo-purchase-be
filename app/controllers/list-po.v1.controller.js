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
const { errorHandling } = require('../utils/error-handling')

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
    const no_po = `${po_number}/PO/STI/${month}/${year}`
    return no_po
  } catch (error) {
    errorHandling(500, 'Something went wrong when generate new no po')
  }
}

exports.create = async (req, res) => {
  const transaction = await db.sequelize.transaction()

  try {
    const { name, supplier_id, prepared_by, note, no_po, data, reff_no } =
      req.body

    // Validate required fields
    if (!supplier_id) {
      errorHandling(400, 'Supplier ID and PO number are required')
    }

    // Find supplier first to ensure it exists
    const supplier = await suppliers.findByPk(supplier_id)
    if (!supplier) {
      errorHandling(404, 'Supplier Not Found')
    }

    if (no_po) {
      // Handle existing PO
      const existingPo = await list_pos.findOne({
        where: { no_po },
      })

      if (existingPo) {
        // Cancel existing PO and its items
        await Promise.all([
          list_pos.update(
            {
              no_po_revised: no_po,
              canceled: 1,
            },
            {
              where: { no_po },
            }
          ),
          list_po_items.update(
            { approved: 0 },
            {
              where: { list_po_id: existingPo.id },
            }
          ),
        ])
      }
    }

    // Create new PO
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

    // Create PO items if data exists
    if (data?.length > 0) {
      // Validate PO items
      const validatedPoItems = data.map((item) => {
        if (!item.id || !item.quantity || !item.price) {
          errorHandling(400, 'Invalid PO item: missing required fields')
        }

        return {
          list_po_id: newPO.id,
          quantity: item.quantity,
          price: item.price,
          total_price: item.total_price || item.quantity * item.price,
          product_id: item.id,
          barcode: item.barcode,
        }
      })

      await list_po_items.bulkCreate(validatedPoItems, { transaction })
    }

    // Commit transaction
    await transaction.commit()

    // Optional: Send notification
    await sendWhatsappNotification(supplier.name)

    return res.status(201).json({
      message: 'Successfully created Purchase Order',
      data: newPO,
    })
  } catch (error) {
    // Rollback transaction
    await transaction.rollback()

    // Log detailed error
    logger.error('Error in PO creation', {
      error: error.message,
      stack: error.stack,
    })

    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

exports.findAllNoPo = async (req, res) => {
  try {
    const data = await list_pos.findAll({
      where: {
        approved: 1,
        canceled: 0,
      },
      attributes: ['no_po'],
      order: [['no_po', 'DESC']],
    })

    return res.status(200).send({
      message: 'Successfully retrieved all list no po',
      data,
    })
  } catch (error) {
    logger.error('Error in list_pos.findAllNoPo', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

// USED
exports.findAll = async (req, res) => {
  try {
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

    return res.status(200).send({
      message: 'Successfully retrieved all list po',
      data,
    })
  } catch (error) {
    logger.error('Error in list_pos.getAll', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

exports.findAllLvl1 = async (req, res) => {
  try {
    const data = await list_pos.findAll({
      include: [
        {
          model: list_po_items,
          as: 'list_po_items',
        },
      ],
    })
    res.send({
      message: 'berhasil get all list po lvl 1',
      data: data,
    })
  } catch (err) {
    console.log(err, 'ini error')
    res.send({
      message: 'Some error occurred while retrieving list po',
    })
  }
}

exports.findAllLvl2 = async (req, res) => {
  try {
    const data = await list_pos.findAll({
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
    })
    res.send({
      message: 'berhasil get all list po lvl 2',
      data: data,
    })
  } catch (err) {
    console.log(err, 'ini error')
    res.send({
      message: 'Some error occurred while retrieving list po',
    })
  }
}

exports.findAllLvl3 = async (req, res) => {
  try {
    const data = await list_pos.findAll({
      include: [
        {
          model: list_po_items,
          as: 'list_po_items',
          include: [
            {
              model: products,
              include: [
                {
                  model: product_barcodes,
                },
              ],
            },
          ],
        },
      ],
    })
    res.send({
      message: 'berhasil get all list po lvl 1',
      data: data,
    })
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

// USED
exports.delete = async (req, res) => {
  try {
    const id = Number(req.params.id)

    // Validate input: ensure ID is a valid number
    if (isNaN(id) || id <= 0) {
      errorHandling(400, 'Invalid ID. Please provide a valid numeric ID.')
    }

    // Check if the record with the given ID exists
    const listPo = await list_pos.findOne({ where: { id } })
    if (!listPo) {
      errorHandling(404, `List PO with ID ${id} not found.`)
    }

    // Delete the record
    await list_pos.destroy({ where: { id } })

    // Success response
    return res.status(200).json({
      status: 'success',
      id: id,
      message: 'List po deleted successfully.',
    })
  } catch (error) {
    // Log error for development or debugging purposes
    logger.error('Error in list_pos.delete', { error })

    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

// ========================== HANDLE APPROVE ==============================
// USED
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

// USED
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

// USED
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

// USED
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
    await approveNotification({ no_po: newNoPo })
  } else {
    await list_pos.destroy({
      where: { id },
      transaction,
    })
  }
}

// USED
exports.handleApprove = async (req, res) => {
  const transaction = await db.sequelize.transaction()
  try {
    const { id, name, no_po, data } = req.body

    const list_po = await list_pos.findByPk(id, { transaction })
    if (!list_po) {
      errorHandling(404, 'PO Not Found')
    }

    const [pendingItems, rejectItems, approveItems] = sortItems(data)

    await Promise.all([
      handlePendingItems(pendingItems, list_po, name, transaction),
      handleRejectItems(rejectItems, list_po, transaction),
      handleApproveItems(approveItems, transaction),
    ])

    const thereIsApprove = approveItems.length > 0

    await updateMainPO(id, thereIsApprove, no_po, transaction)

    // // Commit transaksi
    await transaction.commit()

    res.status(200).json({
      message: 'Successfully processed list PO',
      data: { id },
    })
  } catch (error) {
    // Rollback transaksi jika terjadi kesalahan
    await transaction.rollback()
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

// USED
exports.approved = async (req, res) => {
  try {
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

    return res.status(200).json({
      message: 'Successfully retrieved all approved list po',
      data,
    })
  } catch (error) {
    logger.error('Error in list_pos.approved', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

exports.sendPo = async (req, res) => {
  const { name, no_po, msg, cc, to, subject, bcc, id } = req.body

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
          <p class="signature">PT Simo Teknologi Indonesia Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} PT Simo Teknologi Indonesia. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `

  try {
    const message = {
      from: `"SIMO TEKNOLOGI INDONESIA" <${process.env.EMAIL}>`,
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
      errorHandling(404, 'No matching record found to update')
    }

    res.status(200).json({
      message: 'PO sent successfully',
    })
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}
