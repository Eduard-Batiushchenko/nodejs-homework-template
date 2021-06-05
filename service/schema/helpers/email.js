const sgMail = require('@sendgrid/mail')

const sendEmail = async (verificationToken, email) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    to: email, // Change to your recipient
    from: process.env.SENDGRID_API_EMAIL, // Change to your verified sender
    subject: 'Confirm ur account',
    html: `<a href='http://localhost:3000/users/verify/${verificationToken}'>Confirmation link<a/>`,
  }
  try {
    await sgMail.send(msg)
    console.log('Email was send successfully')
  } catch (error) {
    console.log(error)
  }
}

module.exports = sendEmail
