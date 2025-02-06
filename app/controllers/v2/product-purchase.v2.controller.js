const {
  TransactionHandler,
  AsyncHandler,
} = require('../../utils/async-handler')
const {
  products,
  product_barcodes,
  product_purchases,
  product_brands,
  product_groups,
  product_types,
  product_variants,
} = require('../../../models')
const { normalizePrice } = require('../../utils/normalize-price')
const { generateBarcode } = require('../../utils/generate-barcode')
const { findOrCreateEntry } = require('../../utils/find-or-create')
const { ErrorAppHandler } = require('../../utils/error-handler')
const SuccessHandler = require('../../utils/success-handler')
const { col } = require('sequelize')

// ✅✅✅✅✅✅
const createProduct = async (data, transaction) => {
  let {
    alias,
    currency,
    price,
    product_grade,
    product_group,
    product_type,
    product_brand,
    product_variant,
    barcode,
    supplier,
    uom,
  } = data

  const [processedBrand, processedGroup, processedType, processedVariant] =
    await Promise.all([
      findOrCreateEntry(product_brands, product_brand, transaction),
      findOrCreateEntry(product_groups, product_group, transaction),
      findOrCreateEntry(product_types, product_type, transaction),
      findOrCreateEntry(product_variants, product_variant, transaction),
    ])

  // Get the next product ID
  const lastProductId = (await products.max('id')) || 0
  const newProductId = lastProductId + 1

  if (!barcode) {
    // generate new barcode for product
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
  }

  const newProduct = await products.create(newProductData, {
    transaction,
  })

  await product_barcodes.create(
    {
      barcode,
      product_id: newProduct.id,
    },
    { transaction }
  )

  return newProduct
}

exports.CreateProductPurchase = TransactionHandler(
  async (req, res, next, transaction) => {
    let { currency, price, barcode, supplier } = req.body

    // jika user barcode tidak null
    if (barcode) {
      const [supplier_id] = supplier.split('|')

      // cek, apakah product dengan barcode yang dimasukkan user apakah sudah ada?
      const productExist = await products.findAll({
        include: [
          {
            model: product_barcodes,
            where: {
              barcode: barcode,
            },
          },
        ],
      })

      // jika sudah ada
      if (productExist.length) {
        // new prodcut purchase
        const newProductPurchase = {
          supplier_id,
          product_id: productExist[0].dataValues.id,
          price: normalizePrice(price),
          currency,
        }

        // get untuk mengecek apakah product purchase sudah ada?
        const existProductPurchase = await product_purchases.findOne({
          where: {
            supplier_id: supplier_id,
            product_id: productExist[0].dataValues.id,
            currency: currency,
          },
        })

        // cek, jika product purchase apakah sudah ada?
        if (existProductPurchase) {
          throw ErrorAppHandler(
            `Product with currency ${currency} is already exist in this supplier`,
            409
          )
        } else {
          await product_purchases.create(newProductPurchase, { transaction })
          return SuccessHandler(res, 'Successfully! create product')
        }
      } else {
        const newProduct = await createProduct(req.body, transaction)
        const plainNewProduct = newProduct.get({ plain: true })
        const { supplier_id, id, price, currency } = plainNewProduct

        await product_purchases.create(
          { supplier_id, product_id: id, price, currency },
          { transaction }
        )

        return SuccessHandler(res, 'Successfully! create product')
      }
    }

    // jika barcode kosong ❌
    else {
      const newProduct = await createProduct(req.body, transaction)
      const plainNewProduct = newProduct.get({ plain: true })
      const { supplier_id, id, price, currency } = plainNewProduct

      await product_purchases.create(
        { supplier_id, product_id: id, price, currency },
        { transaction }
      )

      return SuccessHandler(res, 'Successfully! create product')
    }
  }
)

// ✅✅✅✅✅✅
exports.ProductPurchaseBySupplierId = AsyncHandler(async (req, res) => {
  const id = req.params.id

  const outputData = await product_purchases.findAll({
    where: {
      supplier_id: id,
    },
    attributes: [
      'id',
      'product_id',
      'price',
      'currency',
      [col('product.name'), 'name'],
      [col('product.uom'), 'uom'],
      [col('product.product_variant_name'), 'product_variant_name'],
      [col('product.stock'), 'stock'],
      [col('product.product_barcodes.barcode'), 'barcode'],
    ],
    include: [
      {
        model: products,
        attributes: [],
        include: [
          {
            model: product_barcodes,
            attributes: [],
            required: false,
          },
        ],
        required: false,
      },
    ],
    raw: true,
  })

  return SuccessHandler(
    res,
    'Successfully! get product purchase by supplier id',
    outputData
  )
})
