const product_uom = require('../../controllers/product-uom.v1.controller')
var router = require('express').Router()

module.exports = (app) => {
  // GET
  router.get('/', product_uom.ProductUom)

  app.use('/api/v2/product-uom', router)
}
