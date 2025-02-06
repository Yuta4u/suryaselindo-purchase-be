const { product_barcodes } = require('../../../models')
const { AsyncHandler } = require('../../utils/async-handler')
const SuccessHandler = require('../../utils/success-handler')

// ✅✅✅✅✅✅
exports.ProductBarcodeByProductId = AsyncHandler(async (req, res) => {
  const data = await product_barcodes.findAll({
    where: {
      product_id: req.params.id,
    },
    attributes: ['barcode'],
  })
  return SuccessHandler(res, 'Success', data)
})
