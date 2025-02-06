const { Op, col } = require('sequelize')
const { suppliers, products, product_purchases } = require('../../../models')
const { AsyncHandler } = require('../../utils/async-handler')
const SuccessHandler = require('../../utils/success-handler')
const { ErrorAppHandler } = require('../../utils/error-handler')

// ✅✅✅✅✅✅
exports.CreateSupplier = AsyncHandler(async (req, res) => {
  const isDuplicate = await suppliers.findOne({
    where: {
      [Op.or]: [
        { name: req.body.name },
        { email: req.body.email },
        { phone_no: req.body.phone_number },
      ],
    },
  })

  if (isDuplicate) {
    if (isDuplicate.name === req.body.name) {
      throw ErrorAppHandler(
        `Supplier with name "${req.body.name}" is already exists.`,
        400
      )
    } else if (isDuplicate.email === req.body.email) {
      throw ErrorAppHandler(
        `Supplier with email "${req.body.email}" is already exists.`
      )
    } else if (isDuplicate.phone_no === req.body.phone_number) {
      throw ErrorAppHandler(
        `Supplier with phone number "${req.body.phone_number}" is already exists.`
      )
    }
  }

  const isValidPhoneNumber = /^[0-9]+$/.test(req.body.phone_number)

  if (!isValidPhoneNumber) {
    throw ErrorAppHandler('Phone number is not valid', 400)
  }

  const bankId = req.body?.kode_bank?.split('/')[0] || null
  const bankBranch = req.body?.kode_bank?.split('/')[1] || null

  const supplier = {
    name: req.body.name,
    email: req.body.email,
    phone_no: req.body.phone_number,
    fax_no: req.body.fax_no,
    address: req.body.address,
    npwp: req.body.npwp || null,
    npwp_owner: req.body.npwp_owner,
    bank_id: bankId,
    bank_no: req.body.bank_no,
    bank_account_name: req.body.bank_account_name,
    bank_branch: bankBranch,
    contact: req.body.contact,
    pic: req.body.pic,
    currency: req.body.currency,
    postal_id: 1,
  }

  await suppliers.create(supplier)

  return SuccessHandler(res, 'Successfully! create a new supplier')
})

// ✅✅✅✅✅✅
exports.Supplier = AsyncHandler(async (_, res) => {
  const data = await suppliers.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
  })

  return SuccessHandler(res, 'Successfully! get all suppliers', data)
})

// ✅✅✅✅✅✅
exports.SuppliersWithProduct = async (_, res) => {
  const data = await suppliers.findAll({
    include: [
      {
        model: product_purchases,
        include: [
          {
            model: products,
            attributes: [
              'name',
              'alias',
              'stock',
              'uom',
              'product_group_name',
              'product_brand_name',
              'product_type_name',
              'product_variant_name',
            ],
            required: true,
          },
        ],
      },
    ],
  })

  const outputData = data.reduce((acc, supplier) => {
    const plainData = supplier.get({ plain: true })
    const simplifiedProductPurchases = plainData.product_purchases.reduce(
      (productAcc, x) => {
        productAcc.push({
          id: x.id,
          product_id: x.product_id,
          currency: x.currency,
          price: x.price,
          created_at: x.created_at,
          updated_at: x.updated_at,
          ...x.product,
        })
        return productAcc
      },
      []
    )
    acc.push({
      ...plainData,
      product_purchases: simplifiedProductPurchases,
    })
    return acc
  }, [])

  return SuccessHandler(
    res,
    'Successfully! get all suppliers with product purchases',
    outputData
  )
}

// ✅✅✅✅✅✅
exports.SupplierName = AsyncHandler(async (req, res) => {
  const data = await suppliers.findAll({
    attributes: ['id', 'name'],
  })
  return SuccessHandler(res, 'Successfully! get all suppliers name', data)
})
