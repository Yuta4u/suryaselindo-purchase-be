const { products } = require('../../models')
const { logger } = require('../utils/logger')

// USED
exports.getAll = async (_, res) => {
  try {
    const data = await products.findAll({
      attributes: ['id', 'uom'],
      order: [['uom', 'ASC']],
    })
    const filteredData = data
      .filter((product) => product.uom && product.uom.trim() !== '')
      .reduce((unique, product) => {
        if (!unique.some((p) => p.uom === product.uom)) {
          unique.push(product)
        }
        return unique
      }, [])

    return res.status(200).send({
      message: 'Successfully retrieved all product uom / unit',
      data: filteredData,
    })
  } catch (error) {
    logger.error('Error in product_uom.getAll', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}
