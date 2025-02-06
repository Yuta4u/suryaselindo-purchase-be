const listPo = require('../../controllers/v2/list-po.v2.controller')
var router = require('express').Router()

module.exports = (app) => {
  // GET
  router.get('/', listPo.PO)
  router.get('/approved', listPo.ApprovedPO)

  // POST
  router.post('/', listPo.CreatePO)

  app.use('/api/v2/list-po', router)
}
