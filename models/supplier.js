'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class suppliers extends Model {
    static associate(models) {
      suppliers.hasMany(models.products, {
        foreignKey: {
          name: 'supplier_id',
          as: 'Products',
        },
      })

      // NEW
      suppliers.hasMany(models.product_purchases, {
        foreignKey: 'supplier_id',
      })
    }
  }
  suppliers.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      phone_no: DataTypes.STRING,
      fax_no: DataTypes.STRING,
      address: DataTypes.STRING,
      npwp: DataTypes.STRING,
      npwp_owner: DataTypes.STRING,
      bank_id: DataTypes.INTEGER,
      bank_no: DataTypes.STRING,
      bank_account_name: DataTypes.STRING,
      bank_branch: DataTypes.STRING,
      pic: DataTypes.STRING,
      contact: DataTypes.STRING,
      currency: DataTypes.STRING,
      postal_id: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'suppliers',
      timestamps: true, // Ensure timestamps are enabled
      underscored: true, // Use snake_case for created_at, updated_at
      createdAt: 'created_at', // Explicitly map createdAt to created_at
      updatedAt: 'updated_at', // Explicitly map updatedAt to updated_at
    }
  )
  return suppliers
}
