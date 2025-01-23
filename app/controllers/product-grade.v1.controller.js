const { products } = require('../../models')
const { logger } = require('../utils/logger')
const { Op, fn, col } = require('sequelize')

exports.getAll = async (_, res) => {
  try {
    const data = await products.findAll({
      attributes: [[fn('DISTINCT', col('name')), 'name']],
      order: [['name', 'ASC']],
      where: {
        name: { [Op.ne]: '' },
      },
      raw: true,
    })

    return res.status(200).json({
      message: 'Successfully retrieved all product grades',
      data,
    })
  } catch (error) {
    logger.error('Error in product_grade.getAll', { error: error.message })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}
