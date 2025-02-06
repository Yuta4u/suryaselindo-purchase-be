'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class product_purchases extends Model {
    static associate(models) {
      product_purchases.belongsTo(models.suppliers, {
        foreignKey: 'supplier_id',
      })
      product_purchases.belongsTo(models.products, {
        foreignKey: 'product_id',
      })
    }
  }
  product_purchases.init(
    {
      product_id: DataTypes.INTEGER,
      supplier_id: DataTypes.INTEGER,
      currency: DataTypes.STRING,
      price: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'product_purchases',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )
  return product_purchases
}
