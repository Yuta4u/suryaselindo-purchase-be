const product_grade = require('../../controllers/product-grade.v1.controller')
var router = require('express').Router()

module.exports = (app) => {
  // GET
  router.get('/', product_grade.ProductGrade)

  app.use('/api/v2/product-grade', router)
}
