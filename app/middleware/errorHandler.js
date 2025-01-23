const { logger } = require("../utils/logger")

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack)
  res.status(500).send("Terjadi kesalahan internal server!")
}

module.exports = { errorHandler }
