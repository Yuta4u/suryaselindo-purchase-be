module.exports = (app) => {
  //   const supplier = require("../controllers/supplier.controller")
  const user = require("../controllers/user.v1.controller")
  var router = require("express").Router()

  // POST
  // router.post("/login", user.login)
  router.post("/get-token", user.getToken)

  // GET
  router.get("/get-user", user.getUser)

  app.use("/api/v1/user", router)
}
