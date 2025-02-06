const { product_brands } = require('../../../models')
const { AsyncHandler } = require('../../utils/async-handler')
const SuccessHandler = require('../../utils/success-handler')

// ✅✅✅✅✅✅
exports.ProductBrand = AsyncHandler(async (_, res) => {
  const data = await product_brands.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  })

  return SuccessHandler(res, 'Successfully! get all product brand', data)
})
