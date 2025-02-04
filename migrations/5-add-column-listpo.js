"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Menambahkan kolom supplier_id di tabel list_po
    await queryInterface.addColumn("list_pos", "supplier_id", {
      type: Sequelize.INTEGER,
      allowNull: true, // Membuat kolom ini boleh null
      references: {
        model: "suppliers", // Nama tabel yang dituju
        key: "id", // Nama kolom di tabel supplier
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // Jika supplier dihapus, set supplier_id ke NULL
    })
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("list_pos", "supplier_id")
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
}
