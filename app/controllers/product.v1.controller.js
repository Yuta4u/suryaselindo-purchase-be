const {
  products,
  product_barcodes,
  product_brands,
  product_groups,
  product_types,
  product_variants,
  suppliers,
} = require('../../models')
const { logger } = require('../utils/logger')
const { Op } = require('sequelize') // Import Op dari sequelize
const cache = require('memory-cache')
const { storeImage, deleteImageFromFirebase } = require('../utils/firebasePdf')
const db = require('../../models')
const { normalizePrice } = require('../utils/normalize-price')
const { updatePriceNotification } = require('../utils/update-price-twilio')
const { NumericPrice } = require('../utils/numeric-price')
const { errorHandling } = require('../utils/error-handling')

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction()
  let uploadedImageUrl = null

  try {
    let {
      alias,
      currency,
      price,
      barcode,
      product_grade,
      product_brand,
      product_group,
      product_type,
      product_variant,
      supplier,
      uom,
    } = req.body

    // Validation improvements
    if (
      !currency ||
      !price ||
      !product_grade ||
      !product_brand ||
      !product_group ||
      !product_type ||
      !product_variant ||
      !supplier ||
      !uom
    ) {
      errorHandling(400, 'Missing required fields')
    }

    if (!/^[\d.,]+$/.test(price)) {
      errorHandling(400, 'Invalid price format.')
    }

    // Centralize findOrCreateEntry logic
    const findOrCreateEntry = async (model, value) => {
      if (!value) {
        errorHandling(`Missing value for ${model.name}`)
      }

      if (value.includes('|')) {
        const [entry_id, entry_name] = value.split('|')
        return {
          id: entry_id,
          name: entry_name,
        }
      }

      const [entry] = await model.findOrCreate({
        where: { name: value },
        defaults: { name: value },
        transaction: t,
      })

      return {
        id: entry.id,
        name: entry.name,
      }
    }

    // Parallel processing of related entries
    const [processedBrand, processedGroup, processedType, processedVariant] =
      await Promise.all([
        findOrCreateEntry(product_brands, product_brand),
        findOrCreateEntry(product_groups, product_group),
        findOrCreateEntry(product_types, product_type),
        findOrCreateEntry(product_variants, product_variant),
      ])

    // Get the next product ID
    const lastProductId = (await products.max('id')) || 0
    const newProductId = lastProductId + 1

    const pad = (num, hm) => {
      const safeNum = num || 0
      return safeNum.toString().padStart(hm, '0')
    }

    // Improved barcode generation with error handling
    const generateBarcode = (group, brand, type, variant, productId) => {
      try {
        return `${pad(group.id, 3)}${pad(brand.id, 3)}${pad(type.id, 3)}${pad(
          variant.id,
          4
        )}${pad(productId, 5)}`
      } catch (error) {
        errorHandling(402, 'Failed to generate barcode')
      }
    }

    // Check if barcode exists in DB
    if (barcode) {
      const existingBarcode = await product_barcodes.findOne({
        where: { barcode },
      })

      if (existingBarcode) {
        errorHandling(
          403,
          'Barcode already exists. Please use a different one.'
        )
      }
    } else {
      barcode = generateBarcode(
        processedGroup,
        processedBrand,
        processedType,
        processedVariant,
        newProductId
      )
    }

    // Image upload with more robust validation
    if (req.file) {
      const image = req.file
      const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

      if (!ALLOWED_TYPES.includes(image.mimetype)) {
        errorHandling(400, 'Invalid image type. Allowed: JPEG, PNG, WebP')
      }

      if (image.size > MAX_IMAGE_SIZE) {
        errorHandling(400, 'Image exceeds max size of 5MB')
      }

      uploadedImageUrl = await storeImage(image)
    }

    // Prepare product data with improved naming
    const newProductData = {
      name: product_grade,
      alias: alias || `${processedGroup.name}-${processedVariant.name}`,
      currency,
      barcode,
      price: normalizePrice(price),
      product_brand_id: processedBrand.id,
      product_brand_name: processedBrand.name,
      product_group_id: processedGroup.id,
      product_group_name: processedGroup.name,
      product_type_id: processedType.id,
      product_type_name: processedType.name,
      product_variant_id: processedVariant.id,
      product_variant_name: processedVariant.name,
      supplier: supplier.split('|')[1],
      supplier_id: supplier.split('|')[0],
      uom,
      price_quotation: uploadedImageUrl,
    }

    // Create product with transaction
    const createdProduct = await products.create(newProductData, {
      transaction: t,
    })

    // Create barcode entry
    await product_barcodes.create(
      {
        barcode,
        product_id: createdProduct.id,
      },
      { transaction: t }
    )

    // Commit transaction
    await t.commit()

    res.status(201).json({
      message: 'Product created successfully',
      productId: createdProduct.id,
    })
  } catch (error) {
    // Rollback transaction
    await t.rollback()

    if (uploadedImageUrl) {
      await deleteImageFromFirebase(uploadedImageUrl)
    }
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

exports.findAll = async (req, res) => {
  try {
    const data = await products.findAll({
      where: {
        id: {
          [Op.ne]: 1,
        },
      },
      include: [
        {
          model: product_barcodes,
          attributes: ['barcode'],
          required: true, // Perbaikan dari "require" ke "required"
        },
      ],
    })

    return res.status(200).json({
      message: 'Successfully retrieved all products',
      data,
    })
  } catch (error) {
    logger.error('Error in products.findAll', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

exports.updateProduct = async (req, res) => {
  const t = await db.sequelize.transaction()
  try {
    const { product_id, price, barcode } = req.body

    if (!product_id) {
      errorHandling(400, 'Product ID is Required')
    }

    const updateData = {}

    if (price) {
      updateData.price = NumericPrice(price)
    }

    if (barcode) {
      // Check if barcode already exists
      const existingBarcode = await product_barcodes.findOne({
        where: { barcode },
      })

      if (existingBarcode) {
        errorHandling(400, 'Barcode already exists for another product')
      }

      updateData.barcode = barcode

      // test
      const [barcodeUpdateCount] = await product_barcodes.update(
        { barcode },
        { where: { product_id }, transaction: t }
      )

      if (barcodeUpdateCount === 0) {
        errorHandling(404, 'Barcode not found for the specified product')
      }
    }

    if (Object.keys(updateData).length === 0) {
      errorHandling(400, 'No valid fields to update')
    }

    const [updatedRowsCount] = await products.update(updateData, {
      where: { id: product_id },
      transaction: t,
    })

    if (updatedRowsCount === 0) {
      errorHandling(404, 'Product not found')
    }

    // await updatePriceNotification(msgParam)
    await t.commit()

    // await updatePriceNotification(msgParam)
    return res.status(200).json({
      message: 'Successfully updated product',
    })
  } catch (error) {
    await t.rollback()
    logger.error('Error in product.updatePrice', {
      error: error.message,
      productId: req.body.product_id,
    })

    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

// USED
exports.findAllBySupplierId = async (req, res) => {
  try {
    const data = await products.findAll({
      where: {
        supplier_id: req.params.id,
        deleted_at: null,
      },
      attributes: [
        'id',
        'name',
        'product_variant_name',
        'barcode',
        'uom',
        'stock',
        'currency',
        'price',
      ],
      include: [
        {
          model: product_barcodes,
          attributes: ['barcode'],
          require: false,
        },
      ],
    })

    return res.status(200).send({
      message: 'Successfully retrieved product by supplier',
      data: data,
    })
  } catch (error) {
    logger.error('Error in product.findAllBySupplierId', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}
