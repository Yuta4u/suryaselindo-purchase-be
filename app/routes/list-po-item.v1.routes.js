module.exports = (app) => {
  //   const supplier = require("../controllers/supplier.controller")
  const list_po_item = require('../controllers/list-po-item.v1.controller')
  var router = require('express').Router()

  // GET
  router.get('/', list_po_item.findAll)
  router.get('/approved', list_po_item.findAllApproved)
  router.get('/rejected', list_po_item.findAllRejected)
  router.get('/approved/:name', list_po_item.findAllApprovedBySupplierName)
  // router.get("/with-product", list_po_item.findAllWithProduct)

  // POST
  router.post('/', list_po_item.create)
  app.use('/api/v1/list-po-item', router)
}
