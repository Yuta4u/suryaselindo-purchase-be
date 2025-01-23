function NumericPrice(str) {
  return Number(str.replaceAll('.', '').replace(',', '.'))
}

module.exports = { NumericPrice }
