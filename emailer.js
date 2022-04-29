var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

module.exports.sender = function (Email, text, subject){
  var mailOptions = {
    from: 'chatupbussness@gmail.com',
    to: Email,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions);
};