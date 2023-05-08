const nodemailer = require("nodemailer");

module.exports = {
  send: (/* email, otp,  */mailOptions) => {
    return new Promise((resolve, reject) => {

      let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER, 
          pass: process.env.SMTP_PASS,         },
      });

      // let mailOptions = {
      //   from: '"Create Loyalty" <arjun.c@4dlogix.com>', // sender address
      //   to: email, // list of receivers
      //   subject: "Create Loyalty OTP", // Subject line
      //   // text: "Hello world?", // plain text body
      //   html: `<h1>Hi, your otp is</h2>
      //               <b>${otp}</b>`, // html body
      // };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.log(err.message)
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  },
};
