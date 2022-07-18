var express = require('express');
var router = express.Router();
const db = require('../models');
const User = db.User;
const mailer = require('../emailer');
const emailValidator = require('email-validator');
var jwt = require('jsonwebtoken');
const shortid = require('shortid');

router.get('/ManageEmployment', async function(req, res, next) {
  if (!req.user || req.user.dataValues.Admin == false) {
    req.flash('error', 'To manage employees you must login first and be an admin of a company.');
    return res.redirect('/');
  }
  // if looged in and admin of a company then
  // const CompanyId = req.user.dataValues.CompanyId
  // const token = jwt.sign({ id: CompanyId }, process.env.JWT_KEY, { expiresIn: '7d' }) // save in db and if there is not one and haven't expired than it's okay to create a new one!!!
  // res.json({LinkForUsers: `http://${req.headers.host}/users?token=${token}`})
  res.render('users/createUsers', { 
    user: req.user,
  });
});

router.get('/employeesJSON', async function(req, res, next) {
  if (!req.user || req.user.dataValues.Admin == false) {
    return res.redirect('/');
  }
  let users = await User.findAll({ where: { CompanyId: req.user.dataValues.CompanyId } })
  let newUsersArr = []
  users.forEach(user => {
    newUsersArr.push({ Name: user.dataValues.Name, Email: user.dataValues.Email, Admin: user.dataValues.Admin })
  });
  return res.json(newUsersArr);
});

// router.get('/', async function(req, res, next) {
//   // http://${req.headers.host}/reset/?token=${token}`
//   // const token = jwt.sign({ user }, process.env.JWT_KEY, { expiresIn: '30m' })
//   // these 3 in generate link post that I need to make!!!!
//   const link = req.query.token
//   try {
//     jwt.verify(link, process.env.JWT_KEY, async (err, decodedToken) => {
//       if (!decodedToken || !decodedToken.id) {
//         return res.redirect('/');
//       }
//     });
//   } catch (error) {
//     return res.redirect('/')
//   }

//   const flash = req.flash();
//   var error = {type: undefined};
//   if (flash.name != undefined){
//     error = {type: "name", text: flash.name[0]};
//   }
//   if (flash.email != undefined){
//     error = {type: "email", text: flash.email[0]};
//   }
//   if (flash.password != undefined){
//     error = {type: "password", text: flash.password[0]};
//   }
//   res.render('users/new', { 
//     userr: new User(),
//     user: null,
//     error: error, 
//     admin: false
//   });
// });

router.post('/addSingleEmployee', async function(req, res, next) {
  if (!req.user || req.user.dataValues.Admin == false) {
    return res.redirect('/');
  }

  var error;
  if (!emailValidator.validate(req.body.Email)) { // does not work on my email/
    error = 'Email invalid!'
  } else if ( await User.findOne({ where: { Email: req.body.Email } }) != null) { // HERETHERE IS A PROBELEM
    error = 'Email is not signed up yet!'
  } else if (req.body.Name.length >= 17) {
    error = 'Name length must be less than 17 chars!'
  } else if (req.body.Name.length <= 6) {
    error = 'Name length must be more than 6 chars!'
  } else if (typeof req.body.Admin != 'boolean') {
    error = 'Admin is true or false!'
  }
  
  if (error != undefined) {
    return res.end(error);
  }
  let pass = shortid.generate()
  const user = {
    Name: req.body.Name,
    Password: pass,
    Email: req.body.Email,
    Admin: req.body.Admin,
    CompanyId: req.user.dataValues.CompanyId
  }

  var som = await User.create(user);
  som.save();
  //send email to everyone about it
  const mailOptions = {
    to: user.Email,
    subject: 'Qbook - Login Information',
    text: `
    You are signed up for a company in Qbook, \n
    Here are your login information:\n
    Name: ${user.Name}\n
    Email: ${user.Email}\n
    Password: ${user.Password}\n
    Please verify your account by clicking on this link below:\n
    http://${req.headers.host}/sessions/loginFirst\n\n
    \n\n
    All rights reserved to Qbook.`
  }
  // Note: your password is one time only

  mailer.sender(mailOptions.to, mailOptions.text, mailOptions.subject);

  res.end('response')//////////////////////////////////////////////////////////////////////////////////////
});

router.get('/workwithus', async function(req, res, next) {
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
  res.render('users/new', { 
    userr: new User(),
    user: null,
    error: error,
    admin: true
  });
});

router.post('/workwithus', async function(req, res, next) {  
  var error;
  // if (!emailValidator.validate(req.body.Email)) { // does not work on my email/
  //   error = req.flash('email', 'Email invalid')
  // } else 
  if ( await User.findOne({ where: { Email: req.body.Email } }) != null) { // HERETHERE IS A PROBELEM
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
    return res.redirect('/users/workwithus');
  }
  const user = {
    Name: req.body.Name,
    Password: req.body.Password,
    Email: req.body.Email,
    Admin: true
  }
  let shortId = shortid.generate();
  let buff = Buffer.from(JSON.stringify(user), "utf-8");
  //save in db
  await db.Tokens.create({ shortId: shortId, dataJson: buff, isValidated: false});

  const token = jwt.sign({ shortId: shortId }, process.env.JWT_KEY, { expiresIn: '840000m' })
  const mailOptions = { // check email confirmation works
    to: user.Email,
    subject: 'Qbook - Validate Email',
    text: `
    Please verify your account by clicking on this link below:\n\n
    http://${req.headers.host}/users/verify-email-admin?token=${token}\n\n
    \n\n
    This Link shall expire in 15m, Thank you.\n\n
    (C) All rights reserved to Qbook.`
  }
  mailer.sender(mailOptions.to, mailOptions.text, mailOptions.subject);
  res.render('error', { message: 'Email Sent', error: {status: 'You have 15 minutes to verify your account.', stack: ''}})
  //res.send('Email sent')
});

router.get('/verify-email-admin', async function(req, res, next) {
  try {
    const token = req.query.token;
    jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
      if (err != null) {
        console.log(err)
        req.flash('error', 'Email Verification token is invalid or has expired.');
        return res.redirect('/')
      }
      let tokenDB = await db.Tokens.findOne({ where: { shortId: decodedToken.shortId }});
      if (!decodedToken || tokenDB == undefined) { // make it equal to the shortId generated
        return res.redirect('/')
      }
      await tokenDB.update(
        { isValidated: true }
      );
      let newToken = Buffer.from(decodedToken.shortId).toString('base64')
      //make user validated in token db
      return res.redirect(`/book/createCompany?token=${newToken}`);
    });
  } catch (err) {
    req.flash('error', 'Email Verification token is invalid or has expired.');
    return res.redirect('/users/workwithus');
  }
});



// router.post('/', async function(req, res, next) {  
//   var error;
//   if (!emailValidator.validate(req.body.Email)) { // does not work on my email/
//     error = req.flash('email', 'Email invalid')
//   } else if ( await User.findOne({ where: { Email: req.body.Email } }) != null) { // HERETHERE IS A PROBELEM
//     error = req.flash('email', 'Email is not signed up yet')
//   } else if (req.body.Password.length <= 7) {
//     error = req.flash('password', 'Password length must be more than 7 chars')
//   } else if (req.body.Password.length >= 17) {
//     error = req.flash('password', 'Password length must be less than 17 chars')
//   } else if (req.body.Name.length >= 17) {
//     error = req.flash('name', 'Name length must be less than 17 chars')
//   } else if (req.body.Name.length <= 6) {
//     error = req.flash('name', 'Name length must be more than 6 chars')
//   }
  
//   if (error != undefined) {
//     return res.redirect('/users');
//   }
  
//   const link = req.query.token
//   try {
//     jwt.verify(link, process.env.JWT_KEY, async (err, decodedToken) => {
//       const did = decodedToken.id;
//       if (!did) {
//         req.flash('error', 'You need a link to join a company.');
//         return res.redirect('/users');
//       }
//       const user = {
//         Name: req.body.Name,
//         Password: req.body.Password,
//         Email: req.body.Email,
//         CompanyId: did
//       }
//       const token = jwt.sign({ user }, process.env.JWT_KEY, { expiresIn: '30m' })
//       const mailOptions = {
//         to: user.Email,
//         subject: 'Qbook - Validate Email',
//         text: `
//         Please verify your account by clicking on this link below:\n\n
//         http://${req.headers.host}/users/verify-email?token=${token}\n\n
//         \n\n
//         (C) All rights reserved to Qbook.`
//       }
//       mailer.sender(mailOptions.to, mailOptions.text, mailOptions.subject);
//       res.send('Email sent')
//     });
//   } catch (error) {
//     return res.redirect('/users')
//   }
  
// });

// router.get('/verify-email', async function(req, res, next) {
//   try {
//     const token = req.query.token;
//     jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
//       let checkIf = await User.findOne({ where: { Email: decodedToken.user.Email }});
//       if(checkIf != undefined) {
//         return res.redirect('/')
//       }
//       const user = await User.create(
//         { Name: decodedToken.user.Name, Password: decodedToken.user.Password, Email: decodedToken.user.Email, CompanyId: decodedToken.user.CompanyId }
//       );
//       user.dataValues.CompanyId = decodedToken.user.CompanyId;
//       await user.save();
//       try {
//         return res.redirect('/');
//       } catch (err) {
//         return res.render('users/new', { user, error: req.flash('error'), admin: false});
//       }
//     });
//   } catch (err) {
//     req.flash('error', 'Email Verification token is invalid or has expired.');
//     return res.redirect('/users');
//   }
// });

module.exports = router;