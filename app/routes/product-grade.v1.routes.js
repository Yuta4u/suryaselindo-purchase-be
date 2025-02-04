module.exports = (app) => {
  const product_grade = require('../controllers/product-grade.v1.controller')
  var router = require('express').Router({
    include: ['name'],
  })

  // GET
  router.get('/', product_grade.ProductGrade)

  app.use('/api/v1/product-grade', router)
}
