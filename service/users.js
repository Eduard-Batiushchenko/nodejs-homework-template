const User = require('./schema/users-schema')

const findUser = email => {
  return User.findOne({ email })
}

const findUserById = id => {
  return User.findOne({ _id: id })
}

const setUpToken = (id, token) => {
  return User.findOneAndUpdate({ _id: id }, { token: token }, { new: true })
}

const updateAvatarUrl = (id, newAvatar) => {
  return User.findOneAndUpdate(
    { _id: id },
    { avatarURL: newAvatar },
    { new: true },
  )
}

module.exports = {
  findUser,
  setUpToken,
  findUserById,
  updateAvatarUrl,
}
