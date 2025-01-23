module.exports = (app) => {
  const listPo = require("../controllers/list-po.v1.controller")
  const multer = require("multer")
  var router = require("express").Router()
  const upload = multer({ storage: multer.memoryStorage() })

  // GET
  router.get("/", listPo.findAll)
  router.get("/no-po", listPo.findAllNoPo)
  // router.get("/lvl1", listPo.findAllLvl1)
  // router.get("/lvl2", listPo.findAllLvl2)
  // router.get("/lvl3", listPo.findAllLvl3)
  router.get("/approved", listPo.approved)
  // router.get("/rejected", listPo.rejected)

  // POST
  router.post("/", listPo.create)
  router.post("/approval", listPo.handleApprove)
  router.post("/send-po", upload.single("file"), listPo.sendPo)

  // DELETE
  router.delete("/:id", listPo.delete)

  app.use("/api/v1/list-po", router)
}
