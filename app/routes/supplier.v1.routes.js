module.exports = (app) => {
  //   const supplier = require("../controllers/supplier.controller")
  const supplier = require("../controllers/supplier.v1.controller")
  var router = require("express").Router()

  // GET
  router.get("/", supplier.findAll)
  router.get("/with-product", supplier.findAllWithProduct)
  router.get("/name", supplier.findAllName)
  router.get("/:id", supplier.findOne)

  // POST
  router.post("/", supplier.create)

  // PUT
  router.put("/update", supplier.update)
  app.use("/api/v1/supplier", router)
}
