var express = require('express');
var router = express.Router();
const db = require('../models');
const User = db.Users;
const mailer = require('../emailer');
const emailValidator = require('email-validator');
var jwt = require('jsonwebtoken');

router.get('/', async function(req, res, next) {
  const flash = req.flash();
  var error = {type: undefined};
  if (flash.name != undefined){
    error = {type: "name", text: flash.name[0]};
  }
  if (flash.email != undefined){
    error = {type: "email", text: flash.email[0]};
  }
  if (flash.password != undefined){
    error = {type: "password", text: flash.password[0]};
  }
  console.log(error)
  res.render('users/new', { 
    userr: new User(),
    user: null,
    error: error
  });
});

router.post('/', async function(req, res, next) {
  var error;
  if (!emailValidator.validate(req.body.Email)) { // does not work on my email/
    error = req.flash('email', 'Email invalid')
  } else if ( await User.findOne({ where: { Email: req.body.Email } }) != null) {
    error = req.flash('email', 'Email is not signed up yet')
  } else if (req.body.Password.length <= 7) {
    error = req.flash('password', 'Password length must be more than 7 chars')
  } else if (req.body.Password.length >= 17) {
    error = req.flash('password', 'Password length must be less than 17 chars')
  } else if (req.body.Name.length >= 17) {
    error = req.flash('name', 'Name length must be less than 17 chars')
  } else if (req.body.Name.length <= 6) {
    error = req.flash('name', 'Name length must be more than 6 chars')
  }
  
  if (error != undefined) {
    return res.redirect('/users');
  }

  const user = {
    Name: req.body.Name,
    Password: req.body.Password,
    Email: req.body.Email
  }
  console.log('email')
  const token = jwt.sign({ user }, process.env.JWT_KEY, { expiresIn: '30m' })
  console.log('email')
  const mailOptions = {
    to: user.Email,
    subject: 'My App - Validate Email',
    text: `
    Please verify your account by clicking on this link below:\n\n
    http://${req.headers.host}/users/verify-email?token=${token}\n\n
    \n\n
    All rights reserved to the App.`
  }
  mailer.sender(mailOptions.to, mailOptions.text, mailOptions.subject);
  res.send('Email sent')
});

router.get('/verify-email', async function(req, res, next) {
  res.send('Verifying')
  try {
    const token = req.query.token;
    jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
      console.log(decodedToken)
      const user = await User.create(
        { Name: decodedToken.user.Name, Password: decodedToken.user.Password, Email: decodedToken.user.Email }
      );

      console.log('1', user);
      try {
        console.log('inserting');
        return res.redirect('/');
      } catch (err) {
        console.log(err);
        return res.render('users/new', { user, error: req.flash('error')});
      }
    });
  } catch (err) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/users');
  }
});

module.exports = router;