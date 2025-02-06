// kepake

const { logger } = require('./logger')

const ErrorAppHandler = (message, statusCode) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.status = `${statusCode}`.startsWith('4') ? 'failed' : 'error'
  logger.error(message, { error })

  return error
}

module.exports = { ErrorAppHandler }
