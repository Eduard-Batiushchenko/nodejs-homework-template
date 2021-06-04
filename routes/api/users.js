const express = require('express')
const router = express.Router()
const Joi = require('joi')
const bCrypt = require('bcryptjs')
const { join, extname } = require('path')
const { v1 } = require('uuid')
const jwt = require('jsonwebtoken')
const {
  findUser,
  setUpToken,
  updateAvatarUrl,
  findUserByToken,
} = require('../../service/users')
const multer = require('multer')
const User = require('../../service/schema/users-schema')
const {
  checkTokenMiddleware,
  compressImage,
} = require('../../service/users.middleware')
const gravatar = require('gravatar')
const sendEmail = require('../../service/schema/helpers/email')

const TEMP_FILES_DIR = join(process.cwd(), 'tmp')

const diskStorage = multer.diskStorage({
  destination: TEMP_FILES_DIR,
  filename: (req, file, cb) => {
    const ext = extname(file.originalname)
    const fileName = Date.now() + ext
    cb(null, fileName)
  },
})

const upload = multer({ storage: diskStorage })
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .min(3)
    .max(6)
    .required(),
  subscription: Joi.string(),
})

const verifySchema = Joi.object({
  email: Joi.string().email().required(),
})

router.post('/signup', async (req, res, next) => {
  const { value, error } = schema.validate(req.body)
  const { email, password, subscription = 'starter' } = value
  const user = await findUser(email)
  if (error) {
    return res.status(400).json({ message: error.message })
  }

  if (user) {
    return res.status(401).json({ message: 'Email already used' })
  }
  try {
    const hashedPassword = await bCrypt.hash(
      password,
      await bCrypt.genSalt(Number(process.env.PASSWORD_SALT)),
    )
    const verifyToken = v1()
    const newUser = new User({
      email,
      password: hashedPassword,
      subscription,
      avatarURL: gravatar.url(email),
      verifyToken,
    })
    await newUser.save()
    await sendEmail(verifyToken, email)
    res.status(201).json({
      user: {
        email,
        subscription,
      },
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/login', async (req, res, next) => {
  const { value, error } = schema.validate(req.body)
  const { email, password } = value

  if (error) {
    return res.status(400).json({ message: error.message })
  }
  try {
    const user = await findUser(email)
    const checkPassword = await bCrypt.compare(password, user.password)

    if (!user || !checkPassword) {
      return res.status(401).json({ message: 'Email or password is wrong' })
    }
    if (!user.verify) {
      return res
        .status(403)
        .json({ message: 'You need to confirm ur email before login' })
    }
    const payload = {
      id: user.id,
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' })
    await setUpToken(user.id, token)
    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/logout', checkTokenMiddleware, async (req, res, next) => {
  const id = req.userId
  const user = req.user
  if (!user) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'Not authorized',
    })
  }
  try {
    await setUpToken(id, null)
    res.status(204).json({
      status: 'No Content',
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/current', checkTokenMiddleware, async (req, res, next) => {
  const user = req.user
  if (!user) {
    return res.status(401).json({
      status: 'Unauthorized',
      message: 'Not authorized',
    })
  }
  res.json({
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  })
})

router.patch(
  '/avatars',
  upload.single('avatar'),
  checkTokenMiddleware,
  compressImage,
  async (req, res, next) => {
    const id = req.userId
    try {
      const newAvatarUrl = req.newUrl
      await updateAvatarUrl(id, newAvatarUrl)
      res.json({
        avatarURL: newAvatarUrl,
      })
    } catch (error) {
      return res.status(400).json({ message: error.message })
    }
  },
)

router.get('/verify/:verificationToken', async (req, res, next) => {
  const { verificationToken } = req.params
  const user = await findUserByToken(verificationToken)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  await user.updateOne({ verify: true, verifyToken: null })
  res.status(200).json({ message: 'Verification successful' })
})

router.post('/verify', async (req, res, next) => {
  const { error, value } = verifySchema.validate(req.body)
  if (error) {
    return res.status(400).json({ message: 'missing required field email' })
  }
  try {
    const { email } = value
    const user = await findUser(email)
    if (user.verify) {
      return res
        .status(400)
        .json({ message: 'Verification has already been passed' })
    }
    const { verifyToken } = user
    sendEmail(verifyToken, email)
    res.status(200).json({ message: 'Verification email sent' })
  } catch (error) {
    res.status(404).json({ message: error })
  }
})

module.exports = router
