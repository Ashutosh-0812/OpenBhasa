const nodemailer = require('nodemailer')

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    const mailOptions = {
      from: `"OpenBhasha Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('📧 Email sent successfully to:', to)
    return result
  } catch (error) {
    console.error('Email error:', error)
    throw new Error(`Email could not be sent: ${error.message}`)
  }
}

module.exports = sendEmail
