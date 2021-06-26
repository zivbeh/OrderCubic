var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;


const db = require('../models');
const User = db.Users;


passport.use(new LocalStrategy(
    {
        usernameField: 'Email',
        passwordField: 'Password',
    },
    async function (email, password, done) {
        console.log(`email: ${email}`);

        const user = await User.findOne({ where: { Email: email } }, async function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Invalid email/password1' }); //// fix 
            }
        });
        
        console.log(user);
        if (user === null){
            console.log('Invalid email/password');
            return done(null, false, { message: 'Invalid Email/Password' });
        }

        if(password.length<7 || password.length>15){
            return done(null, false, { message: 'Password must be between 7 to 15 chars' });
        }
        if(!password || password === null || password == undefined){
            return done(null, false, { message: 'You have to feel the Password Field' });
        }
        
        console.log('CheckPassword');
        var theemailPass = user.dataValues.Password;
        await user.checkPassword(password,theemailPass).then(function (valid) {
            if (!valid) {
                console.log('Invalid Password');
                return done(null, false, { message: 'Invalid Password' });
            }
            return done(null, user);
        });
    }
));

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findByPk(jwt_payload.id, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));

passport.serializeUser(function(user, done) {
    console.log('serialized', user);
    return done(null, user.id);;
});

passport.deserializeUser(async function(id, done) {
    const user = await User.findByPk(id);
    done(null, user);
});



module.exports = passport;