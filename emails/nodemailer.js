var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD
  }
});

function sendmail(plant, message, sendto){
  transporter.sendMail({
    from: process.env.GMAIL_USERNAME,
    to: sendto,
    subject: `New message from ${plant}`,
    text: `${message}`
  }, (error, info) => {
    if (error) throw error
    res.end();
  });
}

module.exports = sendmail;
