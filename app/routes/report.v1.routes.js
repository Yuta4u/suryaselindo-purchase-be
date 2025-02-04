module.exports = (app) => {
  const report = require('../controllers/report.v1.controller')
  var router = require('express').Router()

  // GET
  router.get('/topspendingamount', report.TopSpendingAmount)
  router.get('/detailtopspending', report.GetDetailTopSpendingAmount)

  app.use('/api/v1/report', router)
}
