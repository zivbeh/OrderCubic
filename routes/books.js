var express = require('express');
var router = express.Router();
const db = require('../models');
const User = db.User;
const formidable = require('formidable');
var jwt = require('jsonwebtoken');
var fs = require('fs');
const shortid = require('shortid');
const path = require('path');
const emailValidator = require('email-validator');
const mailer = require('../emailer');

function delteFileByPath (InsertPath) {
  let NewPath = path.join(__dirname, '../public/images/plan')
          + '/'+`${InsertPath}.png`
  if (fs.existsSync(NewPath)) {
    try {
      fs.unlinkSync(NewPath)
      return 'data';
      //file removed
    } catch(err) {
      console.error(err)
      return err;
    }
  } else {
    return "file doesn't exist in system";
  }
}

router.get('/createCompany', async (req, res) => {
    try {
        // if (req.user && req.user.dataValues.Admin == true) {
        //     return res.render('orders/company', { user: req.user }); /// if does it then edit post!!!!
        // }
        const token = req.query.token;
        let decodedToken = Buffer.from(token, 'base64').toString();
        //jwt.verify(token, process.env.JWT_KEY, async (err, decodedToken) => {
            // let checkIf = await User.findOne({ where: { Email: decodedToken.user.Email }});
            // if(checkIf != undefined) {
            //   return res.redirect('/')
            // }
            let t = await db.Tokens.findOne({ where: { shortId: decodedToken } });
            if (decodedToken && t != undefined && t.dataValues.isValidated == true) {
                return res.render('orders/company', { user: null });
            }
            return res.redirect('/users/workwithus')
        //});
    } catch (error) {
        return res.redirect('/users/workwithus');
    }
});

router.post('/createCompany', async (req, res) => {
    const token = req.query.token;
    let decodedToken = Buffer.from(token, 'base64').toString();
    let t = await db.Tokens.findOne({ where: { shortId: decodedToken } });
    if (!decodedToken || t == undefined || t.isValidated == false) {
        req.flash('error', 'Token is invalid or has expired.');
        return res.end('/users/workwithus');
    }
    let UserData = JSON.parse(t.dataValues.dataJson.toString('utf8'));
    const buff1 = Buffer.from(JSON.stringify({}), "utf-8");
    const buff2 = Buffer.from(req.body.filesPosition, "utf-8");

    const CompanyData = {
        Name: req.body.Name,
        filesPosition: buff2 // need only this, pos and taken are in companyData
    }
    const Company = await db.Company.create(CompanyData);

    let positions = JSON.parse(req.body.filesPosition)
    let ReqPositions = JSON.parse(req.body.Positions)
    for (const site in positions) {
      for (const building in positions[site]) {
        for (const floor in positions[site][building]) {
          if (ReqPositions[site] != undefined && ReqPositions[site][building] != undefined && ReqPositions[site][building][floor] != undefined) {
            let PosBuffer = Buffer.from(JSON.stringify(ReqPositions[site][building][floor]), "utf-8");
            db.CompanyData.create({
              Site: site, Building: building, Floor: floor, DataTaken: buff1, DataPositions: PosBuffer, CompanyId: Company.dataValues.id
            });
          } else {
            delteFileByPath(positions[site][building][floor]);
          }
        }
      }
    }

    const user = await User.create(
      { Name: UserData.Name, Password: UserData.Password, Email: UserData.Email, Admin: true, CompanyId: Company.dataValues.id}
    );
    user.dataValues.CompanyId = Company.dataValues.id;
    await user.save(); // have it here in case when created it doesn't save the CompanyId in db!
    //the password is being hashed twice which lead to the real password being becoming the first hash and not what the user typed in!!!!! SOLOVED!!!!
    try {
      req.login(user, function(err) {
        return res.end('response') // gives err in ajax somehow!!!
      });
    } catch (err) {
      return res.end('/users/workwithus');
    }
});

router.get('/ReserveCubicle', async (req, res) => {
    const user = req.user;
    if (!user) {
        req.flash('error', 'To get ReserveCubicle you Have to login First');
        res.redirect('/sessions');
    }
    res.render('orders/index', { user: user })
});

router.post('/ReserveCubicleChange', async (req, res) => {
  const user = req.user;
  if (!user) {
      req.flash('error', 'To get ReserveCubicle you Have to login First');
      res.redirect('/sessions');
  }
  var company = await db.CompanyData.findOne({where: { CompanyId: user.dataValues.CompanyId, Site: req.body.s, Building: req.body.b, Floor: req.body.f }})
  let takenArr = JSON.parse(company.dataValues.DataTaken.toString('utf8'));
  const isChosen = JSON.parse(req.body.isChosen) // if reloads again and change it saves for 2 places!!!!!!!!!!
  for (const key in isChosen) {
    if (takenArr[key] == undefined) {
      takenArr[key] = {}
    }
    //before delete
    for (const posi in takenArr[key]) {
      const element = takenArr[key][posi];
      if (element==user.dataValues.id) {
        delete takenArr[key][posi];
      }
    }
    if (isChosen[key] == -1) {
      //console.log("just delete")
    } else if (takenArr[key][isChosen[key]] != undefined) {
      return res.end("Go Over The Cubicles You have Chosen, One Or More Is Already Taken");
    } else {
      takenArr[key][isChosen[key]] = user.dataValues.id;
    }
  }
  const buff = Buffer.from(JSON.stringify(takenArr), "utf-8");
  await company.update(
    { DataTaken: buff }
  );
  return res.end("Good");
});

router.get('/ReserveCubicleJSON', async (req, res) => {
  const user = req.user;
  if (!user) {
      req.flash('error', 'To get ReserveCubicle you Have to login First');
      res.redirect('/sessions');
  }
  const company = await db.Company.findOne({ where: { id: user.dataValues.CompanyId }})
  res.json({ fp: company.dataValues.filesPosition.toString('utf8'), id: req.user.dataValues.Name })
});

router.post('/ReserveCubicleJSON', async (req, res) => {
    const user = req.user;
    if (!user) {
        req.flash('error', 'To get ReserveCubicle you Have to login First');
        res.redirect('/sessions');
    }
    //const company = await db.Company.findOne({ where: { id: user.dataValues.CompanyId }})
    const CompanyData = await db.CompanyData.findOne({ where: { CompanyId: user.dataValues.CompanyId, Site: req.body.site, Building: req.body.building, Floor: req.body.floor } })
    let takenArr = JSON.parse(CompanyData.dataValues.DataTaken.toString('utf8'));
    let isChosen = {};
    NewTakenArr = {};
    for (const time in takenArr) {
      NewTakenArr[time] = {}
      for (const key2 in takenArr[time]) {
        if (takenArr[time][key2] == user.dataValues.id){
          NewTakenArr[time][key2] = user.dataValues.Name;
          isChosen[time] = key2;
        } else {
          let userName = await User.findOne({ where: { id: takenArr[time][key2] }})
          NewTakenArr[time][key2] = userName.Name;
        }
      }
    }
    res.json({ p: CompanyData.dataValues.DataPositions.toString('utf8'), t: NewTakenArr, c: isChosen })
});

router.post('/saveImage', async (req, res) => {
  // authenticate
  const token = req.query.token;
  if (token.length < 1) {
    req.flash('error', 'Need A Token!!!');
    return res.end('/users/workwithus');
  }
  let decodedToken = Buffer.from(token, 'base64').toString();
  let t = await db.Tokens.findOne({ where: { shortId: decodedToken } });
  if (!decodedToken || t == undefined || t.isValidated == false) {
      req.flash('error', 'Token is invalid or has expired.');
      return res.end('/users/workwithus');
  }

  const form = new formidable.IncomingForm();
  // Parse `req` and upload all associated files
  form.parse(req, async function(err, fields, files) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    var oldPath = files['myFile.png'].filepath;
    let generatedId = shortid.generate();
    var newPath = path.join(__dirname, '../public/images/plan')
            + '/'+`${generatedId}.png`
    var readData = fs.readFileSync(oldPath);
    if(!Buffer.isBuffer(readData)){
        readData = new Buffer(readData);
    }

    fs.writeFile(newPath, readData, function(err){
        return res.end(`${generatedId}`)
    })
  });
})

router.post('/deleteImage', async (req, res) => {
  // check ok
  const token = req.query.token;
  let decodedToken = Buffer.from(token, 'base64').toString();
  let t = await db.Tokens.findOne({ where: { shortId: decodedToken } });
  if (!decodedToken || t == undefined || t.isValidated == false) {
      req.flash('error', 'Token is invalid or has expired.');
      return res.end('/users/workwithus');
  }
  // delete file
  let resultOfDelete = delteFileByPath(req.body.path);
  return res.end(resultOfDelete);
})

router.post('/saveEmployees', async function(req, res, next) {
  if (!req.user || req.user.dataValues.Admin == false) {
    return res.redirect('/');
  }

  const form = new formidable.IncomingForm();
    // Parse `req` and upload all associated files
  form.parse(req, async function(err, fields, files) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    var readData = fs.readFileSync(files['myFile.json'].filepath);
    if(!Buffer.isBuffer(readData)){
        readData = new Buffer(readData);
    }
    let json = JSON.parse(readData.toString('utf8'));
    var usersList = []
    for (const email in json) {
      var error;
      if (typeof email != "string" || typeof json[email].Name != "string" || typeof json[email].Admin != "boolean") {
        error = 'invalid type of Email or Name or Admin. At ' + email
      } else if (!emailValidator.validate(email)) { // does not work on my email/
        error = 'Email invalid. At '+email
      } else if ( await User.findOne({ where: { Email: email } }) != null) { // HERETHERE IS A PROBELEM
        error = 'Email is already in use. at '+ email
      } else if (json[email].Name.length >= 17) {
        error = 'Name length must be less than 17 chars. At ' + email
      } else if (json[email].Name.length <= 6) {
        error = 'Name length must be more than 6 chars. At ' + email
      }
      if (error) {
        return res.end(error)
      }

      const user = {
        Name: json[email].Name,
        Password: shortid.generate(),
        Email: email,
        Admin: json[email].Admin,
        CompanyId: req.user.dataValues.CompanyId
      }

      usersList.push(user);
    }
    for (let index = 0; index < usersList.length; index++) {
      const user = usersList[index];
      var som = await User.create(user);
      som.save();
      //send email to everyone about it
      const mailOptions = {
        to: user.Email,
        subject: 'Qbook - Login Information',
        text: `
        You are signed up for a company in Qbook, \n\n
        Here are your login information:\n
        Name: ${user.Name}\n
        Email: ${user.Email}\n
        Password: ${user.Password}\n
        Please verify your account by clicking on this link below:\n\n
        http://${req.headers.host}/sessions/loginFirst\n\n
        \n\n
        All rights reserved to Qbook.`
      }
      // Note: your password is one time only

      mailer.sender(mailOptions.to, mailOptions.text, mailOptions.subject);
    }
    return res.end(`data`)
  });
});

router.get('/CheckIn', async (req, res) => {
  const user = req.user;
  if (!user) {
      req.flash('error', 'To CheckIn you must to login First');
      res.redirect('/sessions'); 
  }
  const company = await db.Company.findOne({where: { id: user.dataValues.CompanyId }}) // pdate in db
});

router.get('/CheckOut', async (req, res) => {
  const user = req.user;
  if (!user) {
      req.flash('error', 'To Check Out you must to login First');
      res.redirect('/sessions');
  }
  const company = await db.Company.findOne({where: { id: user.dataValues.CompanyId }})
});

module.exports = router;