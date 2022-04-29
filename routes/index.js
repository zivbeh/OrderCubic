var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;
const mailer = require('../emailer');
const emailValidator = require('email-validator');

router.get('/', function(req, res, next) {
  var x;
  if (req.user){
    x = req.user.dataValues.Name;
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
  if(!req.body.Email || !emailValidator.validate(req.body.Email)){
    req.flash('error', 'you have to enter a valid email!');
    res.redirect('/forgotPassword');
  }

  const user = await User.findOne({ where: { Email: req.body.Email } });
  if (!user || user === null) {
    req.flash('email', 'No account with that email address exists.');
    return res.redirect('/forgotPassword');
  }
  let shortId = shortid.generate();
  let buff = Buffer.from(JSON.stringify(user), "utf-8");
  //save in db
  await db.Tokens.create({ shortId: shortId, dataJson: buff, isValidated: false});

  const token = jwt.sign({ shortid: shortId }, process.env.JWT_KEY, { expiresIn: '15m' })

  const mailOptions = {
    to: user.dataValues.Email,
    subject: 'Qbook - reset password',
    text:` 
    WARNING!!!\n\n
    At the moment you will click this link your password will be changed!\n\n
    If you have not requested reset password DO NOT click this link.\n\n
    \n\n
    By clicking on this link below you will be able to change your Password:\n\n
    http://${req.headers.host}/reset/?token=${token}\n\n
    This link shall expire in 15m.\n\n
    (C) All rights reserved to Qbook.`
  }

  mailer.sender(mailOptions.to, mailOptions.text, mailOptions.subject);
  res.send(`Check out your Email`);
});
  
router.get('/resetFirst', async function(req, res) {
  let user = req.user
  if (!user) {
    return res.redirect('/');
  }
  res.render('reset', {
    user: user,
    error: req.flash('error')
  });
});

router.post('/resetFirst', async function(req, res) {
    const user = req.user;
    if (!user) {
      return res.redirect('/');
    }
    const realUser = await User.findOne({ where: {Email: user.dataValues.Email} })

    await realUser.update({
      Password: req.body.Password
    });    
    mailer.sender(user.Email, 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.Email + ' has just been changed.\n', 'Your password has been changed - Qbook');    
    res.redirect('/');
  });

router.get('/reset', async function(req, res) {
  try {
    const token = req.query.token;
    jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {

      let tokenDB = await db.Tokens.findOne({ where: { shortId: decodedToken.shortId }});
      if (!decodedToken || tokenDB == undefined) { // make it equal to the shortId generated
        return res.redirect('/')
      }
      let user = JSON.parse(tokenDB.dataValues.dataJson.toString('utf8'))
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
    if (req.body.Password.length <= 7) {
      req.flash('error', 'Password length must be more than 7 chars')
      return res.redirect('/reset');
    } else if (req.body.Password.length >= 17) {
      req.flash('error', 'Password length must be less than 17 chars')
      return res.redirect('/reset');
    }
    const token = req.query.token;
    jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
      let tokenDB = await db.Tokens.findOne({ where: { shortId: decodedToken.shortId }});
      if (!decodedToken || tokenDB == undefined) { // make it equal to the shortId generated
        return res.redirect('/')
      }
      let user = JSON.parse(tokenDB.dataValues.dataJson.toString('utf8'))

      const realUser = await User.findOne({ where: {id: user.dataValues.id} })

      await realUser.update({
        Password: req.body.Password
      });
      // await realUser.save();
      res.redirect('/sessions');
      
      mailer.sender(user.Email, 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.Email + ' has just been changed.\n', 'Your password has been changed');    
    });
  } catch (error) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/forgotPassword');
  }
});

router.get('/errors', function (req,res) {
  res.send(req.flash('error'));
});

module.exports = router;
