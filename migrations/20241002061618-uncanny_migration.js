"use strict"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("products", "price", {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false,
    })
  },
  // async down(queryInterface, Sequelize) {
  //   await queryInterface.dropTable("list_pos")
  // },
}
