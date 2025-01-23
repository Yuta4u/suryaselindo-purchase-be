"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class list_pos extends Model {
    static associate(models) {
      list_pos.hasMany(models.list_po_items, {
        foreignKey: "list_po_id",
        as: "list_po_items",
      })
      list_pos.belongsTo(models.suppliers, {
        foreignKey: "supplier_id",
      })
    }
  }
  list_pos.init(
    {
      no_po: DataTypes.STRING,
      name: DataTypes.STRING,
      prepared_by: DataTypes.STRING,
      approved_by: DataTypes.STRING,
      note: DataTypes.STRING,
      supplier_id: DataTypes.INTEGER,
      approved: DataTypes.SMALLINT,
      rejected: DataTypes.SMALLINT,
      sended: DataTypes.SMALLINT,
      canceled: DataTypes.SMALLINT,
      reff_no: DataTypes.STRING,
      no_po_revised: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "list_pos",
      timestamps: true, // Ensure timestamps are enabled
      underscored: true, // Use snake_case for created_at, updated_at
      createdAt: "created_at", // Explicitly map createdAt to created_at
      updatedAt: "updated_at", // Explicitly map updatedAt to updated_at
    }
  )
  return list_pos
}
