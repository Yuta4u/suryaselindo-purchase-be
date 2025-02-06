const { product_groups } = require('../../../models')
const SuccessHandler = require('../../utils/success-handler')

// ✅✅✅✅✅✅
exports.ProductGroup = async (_, res) => {
  const data = await product_groups.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  })

  return SuccessHandler(res, 'Successfully! get all product group', data)
}
