const {
  list_po_items,
  products,
  list_pos,
  product_barcodes,
} = require('../../models')
const { AsyncHandler } = require('../utils/async-handler')
const SuccessHandler = require('../utils/success-handler')

// ========================== HANDLE GET ALL LIST PO ITEM ==============================
exports.ListPoItem = AsyncHandler(async (_, res) => {
  const data = await list_po_items.findAll()
  return SuccessHandler(res, 'Successfully! get all list po items', data)
})

// ========================== HANDLE GET ALL APPROVED LIST PO ITEM ==============================
exports.ApprovedListPoItem = AsyncHandler(async (req, res) => {
  const data = await list_po_items.findAll({
    attributes: ['quantity', 'total_price', 'updated_at', 'price'],
    where: {
      approved: 1,
    },
    include: [
      {
        model: list_pos,
        attributes: ['no_po', 'name', 'updated_at', 'approved'],
        where: {
          approved: 1,
          canceled: 0,
        },
      },
      {
        model: products,
        attributes: [
          'name',
          'uom',
          'currency',
          'price',
          'product_variant_name',
          'stock',
        ],
        include: [
          {
            model: product_barcodes,
            attributes: ['barcode'],
          },
        ],
      },
    ],
    order: [[list_pos, 'no_po', 'DESC']],
  })

  return SuccessHandler(
    res,
    'Successfully! get all approved list po item',
    data
  )
})

// ========================== HANDLE GET ALL REJECTED LIST PO ITEM ==============================
exports.RejectedListPoItem = AsyncHandler(async (req, res) => {
  const data = await list_po_items.findAll({
    attributes: ['quantity', 'total_price', 'price'],
    include: [
      {
        model: list_pos,
        attributes: ['no_po', 'name', 'updated_at', 'approved'],
        where: {
          rejected: 1,
        },
      },
      {
        model: products,
        attributes: [
          'name',
          'uom',
          'currency',
          'price',
          'product_variant_name',
          'stock',
        ],
        include: [
          {
            model: product_barcodes,
            attributes: ['barcode'],
          },
        ],
      },
    ],
    order: [[list_pos, 'updated_at', 'DESC']],
  })

  return SuccessHandler(
    res,
    'Successfully! get all rejected list po item',
    data
  )
})
