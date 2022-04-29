'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Company.init({
    Name: DataTypes.STRING,
    filesPosition: DataTypes.BLOB // string size is limited so converting into blob is the only way since json doesn't work
  }, {
    sequelize,
    modelName: 'Company',
  });
  return Company;
};