const product_purchase = require('../controllers/product-purchase.v1.controller')
var router = require('express').Router()

module.exports = (app) => {
  router.get('/', product_purchase.ProductPurchase)

  app.use('/api/v1/product-purchase', router)
}
