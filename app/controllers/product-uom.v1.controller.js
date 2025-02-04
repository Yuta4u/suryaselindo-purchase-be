const { products } = require('../../models')
const SuccessHandler = require('../utils/success-handler')

// ========================== HANDLE GET ALL PRODUCT UOM / UNIT ==============================
exports.ProductUom = async (_, res) => {
  const data = await products.findAll({
    attributes: ['id', 'uom'],
    order: [['uom', 'ASC']],
  })
  const filteredData = data
    .filter((product) => product.uom && product.uom.trim() !== '')
    .reduce((unique, product) => {
      if (!unique.some((p) => p.uom === product.uom)) {
        unique.push(product)
      }
      return unique
    }, [])

  return SuccessHandler(
    res,
    'Successfully! get all product uom / unit',
    filteredData
  )
}
