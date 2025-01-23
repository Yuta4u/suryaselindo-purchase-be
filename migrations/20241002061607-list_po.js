'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('list_pos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      no_po: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      prepared_by: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      approved_by: {
        type: Sequelize.STRING,
      },
      note: {
        type: Sequelize.STRING,
      },
      approved: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
      },
      rejected: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
      },
      sended: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('list_pos')
  },
}
