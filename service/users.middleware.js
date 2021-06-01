const jwt = require('jsonwebtoken')
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

module.exports = {
  checkTokenMiddleware,
}
