const jwt = require('jsonwebtoken')
const Jimp = require('jimp')
const { join } = require('path')
const FSpromises = require('fs').promises
const { findUserById } = require('../service/users')

const checkTokenMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')

    if (!token) {
      return res.status(401).json({
        status: 'Unauthorized',
        code: 401,
        message: 'Not authorized',
      })
    }

    const verifyToken = async token => {
      const decodedToken = token.replace('Bearer ', '')
      return await jwt.verify(decodedToken, process.env.JWT_SECRET)
    }

    const data = await verifyToken(token)
    req.userId = data.id
    const userInfo = await findUserById(data.id)
    req.user = userInfo

    next()
  } catch (e) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'Not authorized',
    })
  }
}

const AVATAR_FILES_DIR = join(process.cwd(), '/public/avatars')
const TEMP_FILES_DIR = join(process.cwd(), 'tmp')

const compressImage = async (req, res, next) => {
  const file = req.file
  if (!file) {
    return next(new Error('No file detected'))
  }
  const originalFilePath = req.file.path

  try {
    const image = await Jimp.read(file.path)
    file.destination = file.destination.replace(
      TEMP_FILES_DIR,
      AVATAR_FILES_DIR,
    )
    file.path = file.path.replace(TEMP_FILES_DIR, AVATAR_FILES_DIR)
    const filePath = join(AVATAR_FILES_DIR, file.originalname)
    await image.resize(250, 250).quality(60).write(filePath)
    FSpromises.unlink(originalFilePath)
    const myURL = new URL(
      file.originalname,
      'http://localhost:3000/users/avatars/',
    )
    req.newUrl = myURL.href
    next()
  } catch (error) {
    next(error)
    FSpromises.unlink(originalFilePath)
  }
}

module.exports = {
  checkTokenMiddleware,
  compressImage,
}
