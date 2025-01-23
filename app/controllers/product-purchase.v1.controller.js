const { product_purchases, products, suppliers } = require('../../models')
const { errorHandling } = require('../utils/error-handling')

exports.getProductPurchase = async (req, res) => {
  try {
    const data = await product_purchases.findAll({
      include: [
        {
          model: products,
          as: 'product',
        },
        {
          model: suppliers,
          as: 'supplier',
        },
      ],
    })
    return res.status(201).send({
      message: 'No Data Found',
      data,
    })
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}
