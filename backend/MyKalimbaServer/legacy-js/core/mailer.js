var nodemailer = require("nodemailer");
var config = require("./config");

function buildTransport() {
  var user = config.mail && config.mail.gmailUser;
  var pass = config.mail && config.mail.gmailAppPassword;

  if (!user || !pass) {
    var err = new Error(
      "Email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD",
    );
    err.status = 500;
    throw err;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: user, pass: pass },
  });
}

async function sendMail(opts) {
  var transport = buildTransport();
  return transport.sendMail(opts);
}

module.exports = {
  sendMail: sendMail,
};
