const { uploadSingle } = require('../middleware/multer')

module.exports = (app) => {
  //   const supplier = require("../controllers/supplier.controller")
  const product = require('../controllers/product.v1.controller')
  var router = require('express').Router()

  // GET
  router.get('/', product.findAll)
  router.get('/:id', product.findAllBySupplierId)

  // POST
  router.post('/', uploadSingle, product.create)

  // PUT
  router.put('/update-product', product.updateProduct)
  app.use('/api/v1/product', router)
}
