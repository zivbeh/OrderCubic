'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'companyCodeId', {
      type: Sequelize.INTEGER(11),
      references: {model: "companyCodes", key: "id"},
      onDelete: 'CASCADE'
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'companyCodeId');
  }
};
