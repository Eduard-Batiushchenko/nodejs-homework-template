const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const { join } = require('path')

const contactsRouter = require('./routes/api/contacts')
const usersRouter = require('./routes/api/users')

const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

require('dotenv').config()
app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())

app.use('/users/avatars', express.static(join(__dirname, 'public/avatars')))
app.use('/api/contacts', contactsRouter)
app.use('/users', usersRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

module.exports = app
