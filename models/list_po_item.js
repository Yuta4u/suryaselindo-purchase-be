"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class list_po_items extends Model {
    //
    static associate(models) {
      list_po_items.belongsTo(models.products, {
        foreignKey: "product_id",
      })
      list_po_items.belongsTo(models.list_pos, {
        foreignKey: "list_po_id",
      })
    }
  }
  list_po_items.init(
    {
      quantity: DataTypes.INTEGER,
      approved: DataTypes.INTEGER,
      price: DataTypes.DECIMAL(15, 2),
      total_price: DataTypes.DECIMAL(15, 2),
      product_id: DataTypes.INTEGER,
      list_po_id: DataTypes.INTEGER,
      barcode: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "list_po_items",
      timestamps: true, // Ensure timestamps are enabled
      underscored: true, // Use snake_case for created_at, updated_at
      createdAt: "created_at", // Explicitly map createdAt to created_at
      updatedAt: "updated_at", // Explicitly map updatedAt to updated_at
    }
  )
  return list_po_items
}
