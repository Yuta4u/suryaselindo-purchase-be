'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('list_po_items', 'product_purchase_id', {
      type: Sequelize.INTEGER, // Pastikan tipe datanya sesuai dengan product_purchase.id
      allowNull: true,
      references: {
        model: 'product_purchases', // Nama tabel yang dituju
        key: 'id', // Kolom id yang menjadi referensi
      },
      onUpdate: 'CASCADE', // Opsi untuk update
      onDelete: 'SET NULL', // Opsi untuk delete
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('list_po_items', 'product_purchase_id')
  },
}
