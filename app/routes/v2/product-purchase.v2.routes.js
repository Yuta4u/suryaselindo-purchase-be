const product_purchase = require('../../controllers/v2/product-purchase.v2.controller')
const { uploadSingle } = require('../../middleware/multer')
var router = require('express').Router()

module.exports = (app) => {
  // POST
  router.post('/', uploadSingle, product_purchase.CreateProductPurchase)
  router.get('/:id', product_purchase.ProductPurchaseBySupplierId)

  app.use('/api/v2/product-purchase', router)
}
