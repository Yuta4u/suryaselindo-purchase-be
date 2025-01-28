const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  // service: "gmail",
  secure: true,
  host: process.env.EMAIL_HOST,
  port: 465,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
})

module.exports = {
  transporter,
}
