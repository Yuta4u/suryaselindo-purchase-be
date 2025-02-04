module.exports = (app) => {
  const product_variant = require('../controllers/product-variant.v1.controller')
  var router = require('express').Router()

  // GET
  router.get('/', product_variant.ProductVariant)

  app.use('/api/v1/product-variant', router)
}
