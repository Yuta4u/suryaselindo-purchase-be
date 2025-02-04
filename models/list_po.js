'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class list_pos extends Model {
    static associate(models) {
      list_pos.hasMany(models.list_po_items, {
        foreignKey: 'list_po_id',
        as: 'list_po_items',
      })
      list_pos.belongsTo(models.suppliers, {
        foreignKey: 'supplier_id',
      })
    }
  }

  list_pos.init(
    {
      no_po: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
        validate: {
          notEmpty: { msg: 'Name is required' },
          len: {
            args: [3, 255],
            msg: 'Name must be at least 3 characters long',
          },
        },
      },
      prepared_by: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
        validate: {
          notEmpty: { msg: 'Prepared by is required' },
        },
      },
      approved_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      approved: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        defaultValue: 0,
        validate: {
          isIn: {
            args: [[0, 1]],
            msg: 'Approved must be either 0 or 1',
          },
        },
      },
      rejected: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        defaultValue: 0,
        validate: {
          isIn: {
            args: [[0, 1]],
            msg: 'Rejected must be either 0 or 1',
          },
        },
      },
      sended: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        defaultValue: 0,
        validate: {
          isIn: {
            args: [[0, 1]],
            msg: 'Sended must be either 0 or 1',
          },
        },
      },
      canceled: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        defaultValue: 0,
        validate: {
          isIn: {
            args: [[0, 1]],
            msg: 'Canceled must be either 0 or 1',
          },
        },
      },
      reff_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      no_po_revised: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'list_pos',
      timestamps: true,
      underscored: true, // Gunakan snake_case untuk created_at & updated_at
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )

  return list_pos
}
