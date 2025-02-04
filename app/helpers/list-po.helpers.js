const { ErrorAppHandler } = require('../utils/error-handler')

const ValidateCreatePo = (body) => {
  if (!body.name) {
    throw ErrorAppHandler('Name is required', 400)
  }
  if (!body.supplier_id) {
    throw ErrorAppHandler('Supplier is required', 400)
  }
  if (!body.prepared_by) {
    throw ErrorAppHandler('Prepared by is required', 400)
  }

  return body
}

module.exports = {
  ValidateCreatePo,
}
