const { product_groups } = require('../../models')
const { logger } = require('../utils/logger')

// USED
exports.getAll = async (_, res) => {
  try {
    const data = await product_groups.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    })

    return res.status(200).send({
      message: 'Successfully retrieved all product group',
      data,
    })
  } catch (error) {
    logger.error('Error in product_groups.getAll', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}
