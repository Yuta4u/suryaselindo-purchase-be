const product_barcode = require('../../controllers/v2/product-barcode.v2.controller')
var router = require('express').Router()

module.exports = (app) => {
  // GET
  router.get('/:id', product_barcode.ProductBarcodeByProductId)

  app.use('/api/v2/product-barcode', router)
}
