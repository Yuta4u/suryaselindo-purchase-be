"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // after column rejected
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("list_pos", "canceled", {
      type: Sequelize.SMALLINT,
      allowNull: false,
      defaultValue: 0,
      after: "rejected",
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("list_pos", "canceled")
  },
}
