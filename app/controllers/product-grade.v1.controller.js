const { products } = require('../../models')
const { AsyncHandler } = require('../utils/async-handler')
const { logger } = require('../utils/logger')
const { Op, fn, col } = require('sequelize')
const SuccessHandler = require('../utils/success-handler')

// ========================== HANDLE GET ALL PRODUCT GRADE ==============================
exports.ProductGrade = AsyncHandler(async (_, res) => {
  const data = await products.findAll({
    attributes: [[fn('DISTINCT', col('name')), 'name']],
    order: [['name', 'ASC']],
    where: {
      name: { [Op.ne]: '' },
    },
    raw: true,
  })

  return SuccessHandler(res, 'Successfully! get all product grade', data)
})
