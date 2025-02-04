const {
  product_barcodes,
  product_groups,
  product_types,
  product_brands,
  product_variants,
  products,
} = require('../../models')
const { AsyncHandler } = require('../utils/async-handler')
const SuccessHandler = require('../utils/success-handler')

// ========================== HANDLE GET ALL PRODUCT BARCODES ==============================
exports.ProductBarcode = AsyncHandler(async (_, res) => {
  const data = await product_barcodes.findAll({
    attributes: ['id', 'barcode'],
    order: [['barcode', 'ASC']],
  })

  return SuccessHandler(res, 'Successfully! get all product barcodes', data)
})

// ========================== HANDLE GET ALL PRODUCT BARCODES BY ID ==============================
exports.ProductBarcodeByProductId = AsyncHandler(async (req, res) => {
  const data = await product_barcodes.findAll({
    where: {
      product_id: req.params.id,
    },
    attributes: ['barcode'],
  })
  return SuccessHandler(res, 'Success', data)
})

// ========================== HANDLE GENERATE BARCODE ==============================
exports.GenerateBarcode = AsyncHandler(async (req, res) => {
  const [groupLastId, typeLastId, brandLastId, productLastid, variantLastId] =
    await Promise.all([
      product_groups.max('id'),
      product_types.max('id'),
      product_brands.max('id'),
      products.max('id'),
      product_variants.max('id'),
    ])

  const pad = (num, hm) => {
    const safeNum = num || 0
    return safeNum.toString().padStart(hm, '0')
  }

  const newBarcode = `${pad(groupLastId, 3)}${pad(brandLastId, 3)}${pad(
    typeLastId,
    3
  )}${pad(variantLastId, 4)}${pad(productLastid, 5)}`

  return SuccessHandler(res, 'Successfully! generate new barcode', {
    barcode: newBarcode,
  })
})
