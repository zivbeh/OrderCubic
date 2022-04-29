'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CompanyData', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Site: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Building: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Floor: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      DataTaken: {
        type: Sequelize.BLOB,
        allowNull: false,
      },
      DataPositions: {
        type: Sequelize.BLOB,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CompanyData');
  }
};