// kepake

// Improved barcode generation with error handling
const pad = (num, hm) => {
  const safeNum = num || 0
  return safeNum.toString().padStart(hm, '0')
}

const generateBarcode = (group, brand, type, variant, productId) => {
  return `${pad(group.id, 3)}${pad(brand.id, 3)}${pad(type.id, 3)}${pad(
    variant.id,
    4
  )}${pad(productId, 5)}`
}

module.exports = { generateBarcode }
