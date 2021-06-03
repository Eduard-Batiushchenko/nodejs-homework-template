const express = require('express')
const router = express.Router()
const Joi = require('joi')
const bCrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { findUser, setUpToken } = require('../../service/users')
const User = require('../../service/schema/users-schema')
const { checkTokenMiddleware } = require('../../service/users.middleware')

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .min(3)
    .max(6)
    .required(),
  subscription: Joi.string(),
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
    const newUser = new User({ email, password: hashedPassword, subscription })
    await newUser.save()
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

module.exports = router
