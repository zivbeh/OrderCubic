'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('CompanyData', 'companyId', {
      type: Sequelize.INTEGER(11),
      foreignKey: true,
      references: {model: "Companies", key: "id"},
      onDelete: 'CASCADE'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('CompanyData', 'companyId');
  }
};
