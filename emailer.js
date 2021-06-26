var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chatupbussness@gmail.com',
    pass: process.env.EMAIL_PASSCODE
  }
});

module.exports.sender = function (Email, text, subject){
  var mailOptions = {
    from: 'chatupbussness@gmail.com',
    to: Email,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log('error', error, process.env.EMAIL_PASSCODE, `${process.env.EMAIL_PASSCODE}`);
      } else {
        console.log('Email sent: ' + info.response);
      }
  });
};