const product_uom = require('../controllers/product-uom.v1.controller')
var router = require('express').Router()

module.exports = (app) => {
  router.get('/', product_uom.getAll)
  app.use('/api/v1/product-uom', router)
}
