const product_brand = require('../../controllers/product-brand.v1.controller')
var router = require('express').Router()

module.exports = (app) => {
  // GET
  router.get('/', product_brand.ProductBrand)

  app.use('/api/v2/product-brand', router)
}
