const db = require('./models');
const socketio = require('socket.io');
const session = require('cookie-session')({
    name: 'session',
    secret: process.env.COOKI_SESSION_SECRET,
    saveUninitialized: false,
    cookie: { secure: false },
});

function init(server) {
    const io = socketio(server);
    init.io = io;

    io.on('connection', async socket => {
        let cookieString = socket.request.headers.cookie;
        let req = { connection: { encrypted: false }, headers: { cookie: cookieString } };
        let res = { getHeader: () => { }, setHeader: () => { } };

        session(req, res,  async () => {
            if (req.session && req.session.passport && req.session.passport.user) {

                const user = await db.Users.findByPk(req.session.passport.user, function(err, user) {
                    if (err) return socket.disconnect();
                });

            } else {
                socket.disconnect();
            }
        });
    })
}

module.exports.init = init;
module.exports.flash = flash;
