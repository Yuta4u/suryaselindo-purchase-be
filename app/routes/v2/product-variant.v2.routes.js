const product_variant = require('../../controllers/product-variant.v1.controller')
var router = require('express').Router()

module.exports = (app) => {
  // GET
  router.get('/', product_variant.ProductVariant)

  app.use('/api/v2/product-variant', router)
}
