const { product_variants } = require('../../models')
const SuccessHandler = require('../utils/success-handler')

// ========================== HANDLE GET ALL PRODUCT UOM / UNIT ==============================
exports.ProductVariant = async (_, res) => {
  const data = await product_variants.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  })

  return SuccessHandler(res, 'Successfully! get all product variant', data)
}
