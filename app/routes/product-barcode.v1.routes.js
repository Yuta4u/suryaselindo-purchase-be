module.exports = (app) => {
  //   const supplier = require("../controllers/supplier.controller")
  const product_barcode = require("../controllers/product-barcode.v1.controller")
  var router = require("express").Router()

  // GET
  router.get("/", product_barcode.findAll)
  router.get("/generate", product_barcode.generateBarcode)
  router.get("/:id", product_barcode.findByProductId)
  app.use("/api/v1/product-barcode", router)
}
