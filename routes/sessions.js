var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('sessions/new', { error: req.flash('error'), user: null, first: false, action: "/sessions" });
});

router.get('/loginFirst', function(req, res, next) {
    res.render('sessions/new', { error: req.flash('error'), user: null, first: true, action: "/sessions/loginFirst" });
});

router.post('/',
passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/sessions',
    failureFlash: true
    })
);

router.post('/loginFirst',
passport.authenticate('local', {
    successRedirect: '/resetFirst',
    failureRedirect: '/sessions/loginFirst',
    failureFlash: true
    })
);

router.post('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

module.exports = router;

