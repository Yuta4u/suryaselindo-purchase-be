const { products } = require('../../models')
const { AsyncHandler } = require('../../utils/async-handler')
const SuccessHandler = require('../utils/success-handler')

// ✅✅✅✅✅✅
exports.ProductUom = AsyncHandler(async (_, res) => {
  const data = await products.findAll({
    attributes: ['uom'],
    where: {
      uom: { [Op.ne]: '' }, // Pastikan `Op` diimport dari 'sequelize'
    },
    order: [['uom', 'ASC']],
    raw: true, // Mengurangi overhead dari Sequelize
  })
  const uniqueUoms = [...new Set(data.map((product) => product.uom.trim()))]
  return SuccessHandler(
    res,
    'Successfully! get all product uom / unit',
    uniqueUoms
  )
})
