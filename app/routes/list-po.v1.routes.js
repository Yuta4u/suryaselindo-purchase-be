module.exports = (app) => {
  const listPo = require('../controllers/list-po.v1.controller')
  const multer = require('multer')
  var router = require('express').Router()
  const upload = multer({ storage: multer.memoryStorage() })

  // GET
  router.get('/', listPo.GetAllPO)
  router.get('/no-po', listPo.GetAllNoPO)
  router.get('/approved', listPo.GetAllApprovedPO)
  // router.get("/rejected", listPo.rejected)

  // POST
  router.post('/', listPo.CreatePO)
  router.post('/approval', listPo.ApprovePO)
  router.post('/send-po', upload.single('file'), listPo.sendPo)

  // DELETE
  router.delete('/:id', listPo.DeletePO)

  app.use('/api/v1/list-po', router)
}
