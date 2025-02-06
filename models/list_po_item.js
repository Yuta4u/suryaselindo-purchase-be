'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class list_po_items extends Model {
    static associate(models) {
      list_po_items.belongsTo(models.product_purchases, {
        foreignKey: 'product_purchase_id',
        // as: 'product',
      })
      list_po_items.belongsTo(models.list_pos, {
        foreignKey: 'list_po_id',
      })
    }
  }

  list_po_items.init(
    {
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'Quantity must be an integer' },
          min: { args: [1], msg: 'Quantity must be at least 1' },
        },
      },
      approved: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'Approved must be an integer' },
          min: { args: [0], msg: 'Approved cannot be negative' },
        },
      },
      price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          isDecimal: { msg: 'Price must be a decimal number' },
          min: { args: [0], msg: 'Price must be at least 0' },
        },
      },
      total_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          isDecimal: { msg: 'Total price must be a decimal number' },
          min: { args: [0], msg: 'Total price must be at least 0' },
        },
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'Product ID must be an integer' },
        },
      },
      product_purchase_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'Product Purchase ID must be an integer' },
        },
      },
      list_po_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'List PO ID must be an integer' },
        },
      },
      barcode: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [5, 50],
            msg: 'Barcode length must be between 5 and 50 characters',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'list_po_items',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )
  return list_po_items
}
