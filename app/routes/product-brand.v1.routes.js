module.exports = (app) => {
  const product_brand = require('../controllers/product-brand.v1.controller')
  var router = require('express').Router()

  // GET
  router.get('/', product_brand.ProductBrand)

  app.use('/api/v1/product-brand', router)
}
