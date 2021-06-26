var express = require('express');
var router = express.Router();
var passport = require('passport');
const db = require('../models');
const socketio = require('../liveupdate');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('sessions/new', { error: req.flash('error'), user: null });
});

router.post('/',
passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/sessions',
    failureFlash: true
    }),
    function(req, res, next) {
        console.log('new user connected');
        socketio.io.sockets.emit('msg', `New user connected: ${req.user}`);
    }
);

router.post('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

module.exports = router;

