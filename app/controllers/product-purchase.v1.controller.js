const { product_purchases, products, suppliers } = require('../../models')
const { AsyncHandler } = require('../utils/async-handler')
const SuccessHandler = require('../utils/success-handler')

// ========================== HANDLE GET ALL PRODUCT GROUP ==============================
exports.ProductPurchase = AsyncHandler(async (req, res) => {
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
  return SuccessHandler(res, 'Successfully! get all product purchase', data)
})
