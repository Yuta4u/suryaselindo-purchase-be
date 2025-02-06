'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class products extends Model {
    static associate(models) {
      products.belongsTo(models.suppliers, {
        foreignKey: 'supplier_id',
        as: 'supplierKey',
      })
      products.hasMany(models.product_barcodes, {
        foreignKey: 'product_id',
      })

      // NEW
      products.hasOne(models.product_purchases, {
        foreignKey: 'id',
      })
    }
  }
  products.init(
    {
      name: DataTypes.STRING,
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      alias: DataTypes.STRING,
      stock: DataTypes.INTEGER,
      derivative_stock: DataTypes.INTEGER,
      uom: DataTypes.STRING,
      barcode: DataTypes.STRING,
      parent_id: DataTypes.INTEGER,
      parent_name: DataTypes.STRING,
      root_id: DataTypes.INTEGER,
      product_group_id: DataTypes.INTEGER,
      product_group_name: DataTypes.STRING,
      product_brand_id: DataTypes.INTEGER,
      product_brand_name: DataTypes.STRING,
      product_type_id: DataTypes.INTEGER,
      product_type_name: DataTypes.STRING,
      product_variant_id: DataTypes.INTEGER,
      product_variant_name: DataTypes.STRING,
      root_stock: DataTypes.INTEGER,
      safety_stock: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
      info_updated_at: DataTypes.DATE,
      location: DataTypes.STRING,
      price: DataTypes.INTEGER,
      supplier: DataTypes.STRING,
      supplier_id: DataTypes.INTEGER,
      currency: DataTypes.STRING,
      price_quotation: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'products',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )
  return products
}
