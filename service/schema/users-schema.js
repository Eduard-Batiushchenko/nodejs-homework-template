const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const bCrypt = require('bcryptjs')

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter',
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: String,
  verify: {
    type: Boolean,
    default: false,
  },
  verifyToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
})

// userSchema.methods.setPassword = async function (password) {
//   this.password = await bCrypt.hash(
//     password,
//     await bCrypt.genSalt(Number(process.env.PASSWORD_SALT)),
//   )
// }

// userSchema.methods.validPassword = async function (password) {
//   return await bCrypt.compare(password, this.password)
// }

const User = mongoose.model('user', userSchema)

module.exports = User
