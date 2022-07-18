var nodemailer = require('nodemailer');
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID, // ClientID
  process.env.CLIENT_SECRET, // Client Secret
  process.env.REDIRECT_URI // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

module.exports.sender = async function (Email, text, subject){
  try {
    const accessToken = await oauth2Client.getAccessToken()

    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
          type: "OAuth2",
          user: `${process.env.EMAIL_EMAIL}@gmail.com`, 
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken,
    }});

    var mailOptions = {
      from: `${process.env.EMAIL_EMAIL}@gmail.com`,
      to: Email,
      subject: subject,
      text: text
    };

    smtpTransport.sendMail(mailOptions, (error, response) => {
      error ? console.log(error) : console.log('Email Sent Succesfully!');
      smtpTransport.close();
    });
  } catch (error) {
    console.log(error)
  }
};

// var transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_EMAIL,
//     pass: process.env.EMAIL_PASS
//   }
// });

// module.exports.sender = function (Email, text, subject){
//   var mailOptions = {
//     from: `${process.env.EMAIL_EMAIL}@gmail.com`,
//     to: Email,
//     subject: subject,
//     text: text
//   };
//   transporter.sendMail(mailOptions);
// };