const product_type = require('../../controllers/product-type.v1.controller')
var router = require('express').Router()

module.exports = (app) => {
  // GET
  router.get('/', product_type.ProductType)

  app.use('/api/v2/product-type', router)
}
