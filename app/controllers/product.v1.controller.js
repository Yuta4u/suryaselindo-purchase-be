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
const { TransactionHandler, AsyncHandler } = require('../utils/async-handler')
const { ErrorAppHandler } = require('../utils/error-handler')
const { ValidateProduct } = require('../helpers/product.helpers')
const SuccessHandler = require('../utils/success-handler')

// ========================== HANDLE CREATE PRODUCT ==============================
exports.CreateProduct = TransactionHandler(
  async (req, res, next, transaction) => {
    ValidateProduct(req.body)
    let uploadedImageUrl = null

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

    // validation

    // Centralize findOrCreateEntry logic
    const findOrCreateEntry = async (model, value) => {
      if (!value) {
        throw ErrorAppHandler(`Missing value for ${model.name}`, 400)
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
        transaction,
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
        throw ErrorAppHandler('Failed to generate barcode', 402)
      }
    }

    // Check if barcode exists in DB
    if (barcode) {
      const existingBarcode = await product_barcodes.findOne({
        where: { barcode },
      })

      if (existingBarcode) {
        throw ErrorAppHandler(
          'Barcode already exists. Please use different one.',
          400
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
      transaction,
    })

    // Create barcode entry
    await product_barcodes.create(
      {
        barcode,
        product_id: createdProduct.id,
      },
      { transaction }
    )

    return SuccessHandler(res, 'Product created successfully!', '', 201)
  }
)

// ========================== HANDLE GET ALL PRODUCT ==============================
exports.Product = AsyncHandler(async (req, res) => {
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
        required: true,
      },
    ],
  })

  return SuccessHandler(res, 'Successfully! get all product', data)
})

// ========================== HANDLE UPDATE PRODUCT ==============================
exports.UpdateProduct = AsyncHandler(async (req, res, next, transaction) => {
  const { product_id, price, barcode } = req.body

  if (!product_id) {
    throw ErrorAppHandler('Product ID is required', 400)
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
      throw ErrorAppHandler('Barcode already exists for another product')
    }

    updateData.barcode = barcode

    // test
    const [barcodeUpdateCount] = await product_barcodes.update(
      { barcode },
      { where: { product_id }, transaction }
    )

    if (barcodeUpdateCount === 0) {
      throw ErrorAppHandler('Barcode not found for the specified product')
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw ErrorAppHandler('No valid fields to update')
  }

  const [updatedRowsCount] = await products.update(updateData, {
    where: { id: product_id },
    transaction,
  })

  if (updatedRowsCount === 0) {
    throw ErrorAppHandler('Product not found', 404)
  }

  return SuccessHandler(res, 'Successfully! ')
})

// ========================== HANDLE GET PRODUCT BY SUPPLIER ==============================
exports.ProductBySupplierId = AsyncHandler(async (req, res) => {
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

  return SuccessHandler(res, 'Successfully! get all product by supplier', data)
})
