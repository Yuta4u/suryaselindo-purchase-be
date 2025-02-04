const { ErrorAppHandler } = require('../utils/error-handler')

const ValidateProduct = (body) => {
  if (!body.currency) {
    throw ErrorAppHandler('Currency is required', 400)
  }
  if (!body.price) {
    throw ErrorAppHandler('Price is required', 400)
  }
  if (!body.product_grade) {
    throw ErrorAppHandler('Product grade is required', 400)
  }
  if (!body.product_brand) {
    throw ErrorAppHandler('Product brand is required', 400)
  }
  if (!body.product_group) {
    throw ErrorAppHandler('Product group is required', 400)
  }
  if (!body.product_type) {
    throw ErrorAppHandler('Product type is required', 400)
  }
  if (!body.product_variant) {
    throw ErrorAppHandler('Product variant is required', 400)
  }
  if (!body.supplier) {
    throw ErrorAppHandler('Supplier is required', 400)
  }
  if (!body.uom) {
    throw ErrorAppHandler('Uom/unit is required', 400)
  }
  if (!/^[\d.,]+$/.test(body.price) || body.price == 0) {
    throw ErrorAppHandler('Invalid price', 400)
  }

  return body
}

module.exports = {
  ValidateProduct,
}
