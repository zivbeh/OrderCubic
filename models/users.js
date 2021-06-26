'use strict';
const bcrypt = require('bcrypt');

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.ChatRoom, { through: 'User_Rooms' }, {
        onDelete: 'CASCADE'
      });
    }
  };
  Users.init({
    Name: DataTypes.STRING,
    Password: DataTypes.STRING,
    Email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Users',
  });


  Users.beforeUpdate((user, options) => {
    console.log('before');
    console.log(user);
    return bcrypt.hash(user.dataValues.Password, 10)
        .then( (hash) => {
            user.Password = hash;
            if(user.Password == hash){
              console.log('work');
            }
            console.log(hash);
        })
        .catch(err => { 
            console.log('err: '+ err);
            throw new Error(); 
        });
  });

  Users.beforeCreate((user, options) => {
    console.log('before');
    console.log(user);

    return bcrypt.hash(user.dataValues.Password, 10)
        .then( (hash) => {
            user.Password = hash;
            if(user.Password == hash){
              console.log('work');
            }
            console.log(hash);
        })
        .catch(err => { 
            console.log('err: '+ err);
            throw new Error(); 
        });
  });
  

  Users.prototype.checkPassword = function(candidatePassword, thepasswordemail) {
    console.log(`password: ${candidatePassword} , password: ${thepasswordemail}, password: ${this.Password}`);
      return new Promise((resolve, reject) => {
          bcrypt.compare(candidatePassword, thepasswordemail, function (err, isMatch) {
            console.log(isMatch);
              if (err) return reject(err);
              resolve(isMatch);
          });
      })
  };



  return Users;
};