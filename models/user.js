'use strict';
const bcrypt = require('bcrypt');

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Company);
    }
  };
  User.init({
    Name: DataTypes.STRING,
    Email: DataTypes.STRING,
    Password: DataTypes.STRING,
    Admin: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });


  User.beforeUpdate((user, options) => {
    return bcrypt.hash(user.dataValues.Password, 10)
        .then( (hash) => {
            user.Password = hash;
        })
        .catch(err => { 
            console.log('err: '+ err);
            throw new Error(); 
        });
  });

  // User.beforeCreate((user, options) => {
  //   return bcrypt.hash(user.dataValues.Password, 10)
  //       .then( (hash) => {
  //           //user.Password = hash;
  //       })
  //       .catch(err => { 
  //           throw new Error(); 
  //       });
  // });
  

  User.prototype.checkPassword = function(candidatePassword, thepasswordemail) {
      return new Promise((resolve, reject) => {
          bcrypt.compare(candidatePassword, thepasswordemail, function (err, isMatch) {
              if (err) return reject(err);
              resolve(isMatch);
          });
      })
  };



  return User;
};