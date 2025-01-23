const { product_brands } = require('../../models')
const { logger } = require('../utils/logger')
const cache = require('memory-cache')

// USED
exports.getAll = async (_, res) => {
  try {
    const data = await product_brands.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    })

    return res.status(200).send({
      message: 'Successfully retrieved all product brand',
      data,
    })
  } catch (error) {
    logger.error('Error in product_brands.getAll', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}
