"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("data_suppliers", [
      {
        name: "PT. TONO MACHINE",
        email: "tono_machine@gmail.com",
        alias_name: "TMC",
        phone_number: "081215227000",
        fax: "02155566672",
        address: "Hokkaido, Tokyo, Jepang",
        contact: "+62515622889245",
        currency: "JPY",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "PT. FUQING RONGMA GRINDING",
        email: "fuqing_rongma_grinding@gmail.com",
        alias_name: "FRG",
        phone_number: "081215227000",
        fax: "02155566672",
        address: "Toronto, London, AS",
        contact: "+62515622889245",
        currency: "USD|CNY",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "PT. CHANDOX PRECISION",
        email: "chandox_precision@gmail.com",
        alias_name: "CPR",
        address: "Toronto, London, AS",
        phone_number: "081215227002",
        fax: "02155566612",
        contact: "+6283477901202",
        currency: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "PT. AKKO MAKINA",
        email: "akko_makina@gmail.com",
        alias_name: "AKM",
        address: "Jihan, Pochinki, Jerman",
        phone_number: "081215227033",
        fax: "02155566615",
        contact: "+6281290002348",
        currency: "EUR",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("data_suppliers", null, {})
  },
}
