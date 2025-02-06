const { ErrorAppHandler } = require('../utils/error-handler')

const ValidatePoItem = (item, poId) => {
  if (!item.id || !item.quantity || !item.price) {
    throw ErrorAppHandler('Invalid PO item: missing required fields', 400)
  }

  return {
    list_po_id: poId,
    quantity: item.quantity,
    price: item.price,
    total_price: item.total_price || item.quantity * item.price,
    product_purchase_id: item.id,
    barcode: item.barcode,
  }
}

module.exports = {
  ValidatePoItem,
}
