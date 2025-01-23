"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class product_types extends Model {
    static associate(models) {}
  }
  product_types.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "product_types",
      timestamps: true, // Ensure timestamps are enabled
      underscored: true, // Use snake_case for created_at, updated_at
      createdAt: "created_at", // Explicitly map createdAt to created_at
      updatedAt: "updated_at", // Explicitly map updatedAt to updated_at
    }
  )
  return product_types
}
