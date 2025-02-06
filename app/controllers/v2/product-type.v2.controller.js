const { product_types } = require('../../../models')
const SuccessHandler = require('../../utils/success-handler')

// ✅✅✅✅✅✅
exports.ProductType = async (_, res) => {
  const data = await product_types.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  })

  return SuccessHandler(res, 'Successfully! get all product type', data)
}
