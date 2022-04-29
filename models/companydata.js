'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CompanyData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Company);
    }
  }
  CompanyData.init({
    Site: DataTypes.STRING,
    Building: DataTypes.STRING,
    Floor: DataTypes.INTEGER,
    DataTaken: DataTypes.BLOB,
    DataPositions: DataTypes.BLOB,
  }, {
    sequelize,
    modelName: 'CompanyData',
  });
  return CompanyData;
};