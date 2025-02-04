module.exports = (app) => {
  const product_group = require('../controllers/product-group.v1.controller')
  var router = require('express').Router()

  // GET
  router.get('/', product_group.ProductGroup)

  app.use('/api/v1/product-group', router)
}
