function normalizePrice(price) {
  // Hapus semua titik (.) kecuali sebelum desimal, lalu ganti koma (,) dengan titik (.).
  const normalizedPrice = price.replace(/\./g, "").replace(",", ".")
  return parseFloat(normalizedPrice)
}

module.exports = {
  normalizePrice,
}
