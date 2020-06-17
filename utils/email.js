const nodemailer = require("nodemailer");

/**
 * @desc send out mail to user
 * @param {Object} options
 */
const sendMail = async (options) => {
  // 1. Create a transporter *** service that will send email eg. gmail,sendGrid, mailGun yahoo
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // You need to activate less secure app if you are using GMAIL

  // 2.  Define email options
  const mailOptions = {
    from: "Ecommerce Shop <hello@ecomm.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. send mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
