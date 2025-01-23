'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'uuid', {
      type: Sequelize.UUID,
      allowNull: true,
      defaultValue: Sequelize.UUIDV4,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'uuid')
  },
}
