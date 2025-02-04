const { product_groups } = require('../../models')
const { logger } = require('../utils/logger')
const SuccessHandler = require('../utils/success-handler')

// ========================== HANDLE GET ALL PRODUCT GROUP ==============================
exports.ProductGroup = async (_, res) => {
  const data = await product_groups.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']],
  })

  return SuccessHandler(res, 'Successfully! get all product group', data)
}
