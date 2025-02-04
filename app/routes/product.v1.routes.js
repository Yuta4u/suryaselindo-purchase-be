const { uploadSingle } = require('../middleware/multer')

module.exports = (app) => {
  //   const supplier = require("../controllers/supplier.controller")
  const product = require('../controllers/product.v1.controller')
  var router = require('express').Router()

  // GET
  router.get('/', product.Product)
  router.get('/:id', product.ProductBySupplierId)

  // POST
  router.post('/', uploadSingle, product.CreateProduct)

  // PUT
  router.put('/update-product', product.UpdateProduct)
  app.use('/api/v1/product', router)
}
