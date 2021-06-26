var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.Users;
const mailer = require('../emailer');

router.get('/', function(req, res, next) {
  var x;
  if (req.user){
    x = req.user.dataValues.Name;
    console.log(x)
  }
  else {
    x = null;
  }
  res.render('index', { title: 'Express', user1: x, user: req.user });
});

router.get('/forgotPassword', function(req, res, next) {
  res.render('forgotPassword', { error: req.flash('error')});
});

router.post('/forgotPassword', async function(req, res, next) {
  if(!req.body.Email){
    console.log('redirecting')
    req.flash('error', 'you have to enter a valid email!');
    res.redirect('/forgotPassword');
  }
  console.log('/forgot POST!!!'+ req.body.Email)

  const user = await User.findOne({ where: { Email: req.body.Email } });
  if (!user || user === null) {
    req.flash('email', 'No account with that email address exists.');
    return res.redirect('/forgotPassword');
  }

  const token = jwt.sign({ user }, process.env.JWT_KEY, { expiresIn: '30m' })

  const mailOptions = {
    to: user.dataValues.Email,
    subject: 'My App - reset password',
    text:` 
    WARNING!!!\n\n
    At the moment you will click this link your password will be changed!\n\n
    If you have not requested reset password DO NOT click this link.\n\n
    \n\n
    By clicking on this link below you will can change your Password:\n\n
    http://${req.headers.host}/reset/?token=${token}`
  }

  mailer.sender(mailOptions.to, mailOptions.text, mailOptions.subject);
  res.send(`Check out your Email`);
});
  

router.get('/reset', async function(req, res) {
  try {
    const token = req.query.token;
    jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
      console.log(`token:   ${token}`)

      const user = decodedToken.user;
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgotPassword');
      }
      console.log(user, req.user)
      res.render('reset', {
        user: user,
        error: req.flash('error')
      });
    });
  } catch (error) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/forgotPassword');
  }
});

router.post('/reset', function(req, res) {
  try {
    const token = req.query.token;
    jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
      const user = decodedToken.user;
      console.log(user, '---', req.body.Password)

      const realUser = await User.findOne({ where: {Email: user.Email} })

      await realUser.update({
        Password: req.body.Password
      });
      res.redirect('/sessions');
      
      mailer.sender(user.Email, 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.Email + ' has just been changed.\n', 'Your password has been changed');    
    });
  } catch (error) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/forgotPassword');
  }
});

module.exports = router;
