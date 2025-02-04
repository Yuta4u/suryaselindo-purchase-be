module.exports = (app) => {
  //   const supplier = require("../controllers/supplier.controller")
  const supplier = require('../controllers/supplier.v1.controller')
  var router = require('express').Router()

  // GET
  router.get('/', supplier.Supplier)
  router.get('/with-product', supplier.SupplierWithProduct)
  router.get('/name', supplier.SupplierName)
  router.get('/:id', supplier.OneSupplier)

  // POST
  router.post('/', supplier.CreateSupplier)

  // PUT
  router.put('/update', supplier.UpdateSupplier)
  app.use('/api/v1/supplier', router)
}
