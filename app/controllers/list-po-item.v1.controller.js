const {
  list_po_items,
  products,
  list_pos,
  product_barcodes,
  suppliers,
} = require('../../models')
const { logger } = require('../utils/logger')
const { Op, fn, col } = require('sequelize')

exports.create = async (req, res) => {
  const listPoItem = {
    quantity: req.body.quantity,
    total_price: req.body.total_price,
    product_id: req.body.product_id,
    list_po_id: req.body.list_po_id,
  }

  try {
    const data = await list_po_items.create(listPoItem)
    res.send({
      message: 'berhasil create list po item',
      data: data,
    })
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

exports.findAll = async (_, res) => {
  try {
    const data = await list_po_items.findAll()
    if (data) {
      res.send({
        status_code: 201,
        message: 'berhasil get list po item',
        data,
      })
    }
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

// USED
exports.findAllApproved = async (req, res) => {
  try {
    const data = await list_po_items.findAll({
      attributes: ['quantity', 'total_price', 'updated_at', 'price'],
      where: {
        approved: 1,
      },
      include: [
        {
          model: list_pos,
          attributes: ['no_po', 'name', 'updated_at', 'approved'],
          where: {
            approved: 1,
            canceled: 0,
          },
        },
        {
          model: products,
          attributes: [
            'name',
            'uom',
            'currency',
            'price',
            'product_variant_name',
            'stock',
          ],
          include: [
            {
              model: product_barcodes,
              attributes: ['barcode'],
            },
          ],
        },
      ],
      order: [[list_pos, 'no_po', 'DESC']],
    })

    return res.status(200).json({
      message: 'Successfully retrieved all approved list po item',
      data,
    })
  } catch (error) {
    logger.error('Error in list_po_items.findAllApproved', {
      error,
    })
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}

// USED
exports.findAllApprovedBySupplierName = async (req, res) => {
  try {
    const data = await list_po_items.findAll({
      attributes: ['quantity', 'total_price', 'updated_at', 'price'],
      where: {
        approved: 1,
      },
      include: [
        {
          model: list_pos,
          attributes: ['no_po', 'name', 'updated_at', 'approved'],
          where: {
            approved: 1,
            canceled: 0,
            name: req.params.name,
          },
        },
        {
          model: products,
          attributes: [
            'name',
            'uom',
            'currency',
            'price',
            'product_variant_name',
            'stock',
          ],
          include: [
            {
              model: product_barcodes,
              attributes: ['barcode'],
            },
          ],
        },
      ],
      order: [[list_pos, 'no_po', 'DESC']],
    })
    return res.status(200).json({
      message: 'Successfully retrieved all approved list po item',
      data,
    })
  } catch (error) {
    logger.error('Error in list_po_items.findAllApproved', {
      error,
    })
    return res.status(500).json({
      message: 'An error occured while retrieving all approved list item',
      error: error.message || error,
    })
  }
}

// USED
exports.findAllRejected = async (req, res) => {
  try {
    const data = await list_po_items.findAll({
      attributes: ['quantity', 'total_price', 'price'],
      include: [
        {
          model: list_pos,
          attributes: ['no_po', 'name', 'updated_at', 'approved'],
          where: {
            rejected: 1,
          },
        },
        {
          model: products,
          attributes: [
            'name',
            'uom',
            'currency',
            'price',
            'product_variant_name',
            'stock',
          ],
          include: [
            {
              model: product_barcodes,
              attributes: ['barcode'],
            },
          ],
        },
      ],
      order: [[list_pos, 'updated_at', 'DESC']],
    })

    return res.status(200).json({
      message: 'Successfully retrieved all rejected list item',
      data: data,
    })
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    })
  }
}
