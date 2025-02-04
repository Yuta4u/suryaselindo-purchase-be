const { Op } = require('sequelize')
const { suppliers, products } = require('../../models')
const { errorHandling } = require('../utils/error-handling')
const { AsyncHandler } = require('../utils/async-handler')
const SuccessHandler = require('../utils/success-handler')

// ========================== HANDLE CREATE SUPPLIER ==============================
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
      errorHandling(
        403,
        `Supplier with name "${req.body.name}" already exists.`
      )
    }
    if (isDuplicate.email === req.body.email) {
      errorHandling(
        403,
        `Supplier with email "${req.body.email}" already exists.`
      )
    }
    if (isDuplicate.phone_no === req.body.phone_number) {
      errorHandling(
        403,
        `Supplier with phone number "${req.body.phone_number}" already exists.`
      )
    }
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

// ========================== HANDLE GET ALL SUPPLIER ==============================
exports.Supplier = AsyncHandler(async (_, res) => {
  const data = await suppliers.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
  })

  return SuccessHandler(res, 'Successfully! get all suppliers', data)
})

// ========================== HANDLE GET ALL SUPPLIER WITH PRODUCT ==============================
exports.SupplierWithProduct = async (_, res) => {
  const data = await suppliers.findAll({
    include: [
      {
        model: products,
      },
    ],
  })

  return SuccessHandler(
    res,
    'Successfully! get all suppliers with product',
    data
  )
}

// ========================== HANDLE GET ALL SUPPLIER NAME ==============================
exports.SupplierName = AsyncHandler(async (req, res) => {
  const data = await suppliers.findAll({
    attributes: ['id', 'name', 'pic'],
  })
  return SuccessHandler(res, 'Successfully! get all suppliers name', data)
})

// ========================== HANDLE GET ONE SUPPLIER ==============================
exports.OneSupplier = AsyncHandler(async (req, res) => {
  const data = await suppliers.findOne({
    where: {
      id: req.params.id,
    },
    attributes: [
      'id',
      'name',
      'email',
      'phone_no',
      'fax_no',
      'address',
      'contact',
      'currency',
    ],
  })
  return SuccessHandler(res, 'Successfully! get one supplier', data)
})

exports.UpdateSupplier = async (req, res) => {
  const data = req.body
  console.log(data, 'ini data')
  res.send({
    msg: 'berhasil hit api',
  })
}
