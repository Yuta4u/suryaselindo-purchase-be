const product_type = require("../controllers/product-type.v1.controller")
var router = require("express").Router()

module.exports = (app) => {
  router.get("/", product_type.getAll)
  app.use("/api/v1/product-type", router)
}
