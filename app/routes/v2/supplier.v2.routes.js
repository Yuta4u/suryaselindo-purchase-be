const supplier = require('../../controllers/v2/supplier.v2.controller')
var router = require('express').Router()

module.exports = (app) => {
  // GET
  router.get('', supplier.Supplier)
  router.get('/name', supplier.SupplierName)
  router.get('/with-product', supplier.SuppliersWithProduct)

  // POST
  router.post('/', supplier.CreateSupplier)

  app.use('/api/v2/supplier', router)
}
