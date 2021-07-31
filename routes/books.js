const { resolveInclude } = require('ejs');
var express = require('express');
var router = express.Router();
const db = require('../models');
const User = db.Users;

router.get('/', (req, res) => {
    res.render('orders/index')
});

router.get('/createCompany', (req, res) => {
    db.companyCode.create({ code: req.body.code });
    console.log('work')
});

module.exports = router;