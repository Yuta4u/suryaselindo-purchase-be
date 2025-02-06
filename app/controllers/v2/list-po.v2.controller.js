const { ValidateCreatePo } = require('../../helpers/list-po.helpers')
const {
  TransactionHandler,
  AsyncHandler,
} = require('../../utils/async-handler')
const {
  list_pos,
  list_po_items,
  product_purchases,
  products,
} = require('../../../models')
const { ValidatePoItem } = require('../../helpers/list-po-item.helpers')
const SuccessHandler = require('../../utils/success-handler')
const { col, literal } = require('sequelize')

// ✅✅✅✅✅✅
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

  // CREATE NEW PO
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

// ✅✅✅✅✅✅
exports.ApprovedPO = AsyncHandler(async (req, res) => {
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

// ✅✅✅✅✅✅
exports.PO = AsyncHandler(async (_, res) => {
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
            model: product_purchases,
            attributes: ['price', 'currency'],
            include: [
              {
                model: products,
                as: 'product',
                attributes: [],
              },
            ],
          },
        ],
      },
    ],
    order: [['id', 'DESC']],
  })

  return SuccessHandler(res, 'Successfully retrieved all list po', data)
})
