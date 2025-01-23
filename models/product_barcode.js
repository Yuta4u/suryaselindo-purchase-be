"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class product_barcodes extends Model {
    static associate(models) {
      product_barcodes.belongsTo(models.products, {
        foreignKey: "product_id",
      })
    }
  }
  product_barcodes.init(
    {
      barcode: DataTypes.STRING,
      product_id: DataTypes.INTEGER,
      deleted_at: DataTypes.DATE,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      main_barcode: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "product_barcodes",
      timestamps: true, // Ensure timestamps are enabled
      underscored: true, // Use snake_case for created_at, updated_at
      createdAt: "created_at", // Explicitly map createdAt to created_at
      updatedAt: "updated_at", // Explicitly map updatedAt to updated_at
    }
  )
  return product_barcodes
}
