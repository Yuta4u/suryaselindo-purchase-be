const {
  product_barcodes,
  product_groups,
  product_types,
  product_brands,
  product_variants,
  products,
} = require('../../models')
const { logger } = require('../utils/logger')
const cache = require('memory-cache')

// USED
exports.findAll = async (_, res) => {
  try {
    const cacheKey = 'product_barcode'
    const cacheData = cache.get(cacheKey)
    if (cacheData) {
      return res.status(200).send({
        message: 'Successfully retrieved all product barcode',
        data: cacheData,
      })
    }

    const data = await product_barcodes.findAll({
      attributes: ['id', 'barcode'],
      order: [['barcode', 'ASC']],
    })

    cache.put(cacheKey, data, 5000)

    return res.status(200).send({
      message: 'Successfully retrieved all product barcode',
      data,
    })
  } catch (error) {
    logger.error('Error in product_types.getAll', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

// USED
exports.findByProductId = async (req, res) => {
  try {
    const data = await product_barcodes.findAll({
      where: {
        product_id: req.params.id,
      },
      attributes: ['barcode'],
    })

    return res.status(200).send({
      message: 'Successfully retrieved product barcode by id',
      data,
    })
  } catch (error) {
    logger.error('Error in product_barcodes.findByProductId', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

exports.generateBarcode = async (req, res) => {
  try {
    const [groupLastId, typeLastId, brandLastId, productLastid, variantLastId] =
      await Promise.all([
        product_groups.max('id'),
        product_types.max('id'),
        product_brands.max('id'),
        products.max('id'),
        product_variants.max('id'),
      ])

    const pad = (num, hm) => {
      const safeNum = num || 0
      return safeNum.toString().padStart(hm, '0')
    }

    const newBarcode = `${pad(groupLastId, 3)}${pad(brandLastId, 3)}${pad(
      typeLastId,
      3
    )}${pad(variantLastId, 4)}${pad(productLastid, 5)}`

    res.status(200).json({
      barcode: newBarcode,
    })
  } catch (error) {
    console.error('Error generating barcode:', error)
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}
