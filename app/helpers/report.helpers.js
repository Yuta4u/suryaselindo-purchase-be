const { ErrorAppHandler } = require('../utils/error-handler')

const ValidateReport = (body) => {
  const numUsd = parseInt(body.usd.replace(/\./g, ''), 10)
  const numEur = parseInt(body.eur.replace(/\./g, ''), 10)
  const numCny = parseInt(body.cny.replace(/\./g, ''), 10)
  const numJpy = parseInt(body.jpy.replace(/\./g, ''), 10)

  const isValidNumber = (value) =>
    !isNaN(value) && value !== null && value !== undefined
  if (
    !isValidNumber(numUsd) ||
    !isValidNumber(numEur) ||
    !isValidNumber(numCny) ||
    !isValidNumber(numJpy)
  ) {
    throw ErrorAppHandler(
      'Invalid currency values. Please ensure usd, eur, cny and jpy are numbers.'
    )
  }
  return body
}

module.exports = {
  ValidateReport,
}
