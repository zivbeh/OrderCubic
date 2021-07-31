'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class companyCode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
    }
  };
  companyCode.init({
    code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'companyCode',
  });
  return companyCode;
};