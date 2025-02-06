const { Op } = require('sequelize')
const { suppliers, products } = require('../../models')
const { logger } = require('../utils/logger')
const cache = require('memory-cache')
const { ErrorAppHandler } = require('../utils/error-handler')

// USED
exports.create = async (req, res) => {
  try {
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
          `Supplier with name "${req.body.name}" already exists.`,
          403
        )
      }
      if (isDuplicate.email === req.body.email) {
        throw ErrorAppHandler(
          `Supplier with email "${req.body.email}" already exists.`,
          403
        )
      }
      if (isDuplicate.phone_no === req.body.phone_number) {
        throw ErrorAppHandler(
          `Supplier with phone number "${req.body.phone_number}" already exists.`,
          403
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

    return res.status(200).json({
      message: 'Successfully added a new supplier',
    })
  } catch (error) {
    logger.error('Error in supplier creation', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

exports.findAll = async (_, res) => {
  try {
    const cacheKey = 'suppliers'
    const cacheData = cache.get(cacheKey)

    if (cacheData) {
      return res.status(200).json({
        message: 'Successfully retreieved all suppliers',
        data: cacheData,
      })
    }

    const data = await suppliers.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    })

    cache.put(cacheKey, data)

    return res.status(200).json({
      message: 'Successfully retrieved all suppliers',
      data: data,
    })
  } catch (error) {
    logger.error('Error in suppliers.findAll', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

exports.findAllWithProduct = async (_, res) => {
  try {
    const cacheKey = 'suppliers_with_product'
    const cacheData = cache.get(cacheKey)
    if (cacheData) {
      return res.status(200).json({
        message: 'Successfully retreived all suppliers with product',
      })
    }

    const data = await suppliers.findAll({
      include: [
        {
          model: products,
        },
      ],
    })

    cache.put(cacheKey, data)

    return res.status(200).json({
      message: 'Successfully retrieved all suppliers with product',
      data: data,
    })
  } catch (error) {
    logger.error('Error in suppliers.findAllWithProduct', {
      error,
    })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

// USED
exports.findAllName = async (req, res) => {
  try {
    const data = await suppliers.findAll({
      attributes: ['id', 'name', 'pic'],
    })

    return res.status(200).send({
      message: 'Successfully retrieved all suppliers name',
      data: data,
    })
  } catch (error) {
    logger.error('Error in suppliers.findAllName', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

exports.findOne = async (req, res) => {
  try {
    const cacheKey = 'suppliers_find_one'
    const cacheData = cache.get(cacheKey)
    if (cacheData) {
      return res.status(200).send({
        message: 'Successfully retrieved one supplier',
        data: cacheData,
      })
    }

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

    res.send({
      message: 'Successfully fetch findOne supplier',
      data: data ?? [],
    })
  } catch (error) {
    logger.error('Error in findOne supplier', { error })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

exports.update = async (req, res) => {
  const data = req.body
  console.log(data, 'ini data')
  res.send({
    msg: 'berhasil hit api',
  })
}
