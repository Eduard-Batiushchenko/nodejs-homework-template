const app = require('../app')

const PORT = process.env.PORT || 3000

const uriDb = process.env.DB_HOST
const mongoose = require('mongoose')
const conntection = mongoose.connect(uriDb, {
  promiseLibrary: global.Promise,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
})

conntection
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`)
    })
  })
  .catch(e => {
    console.log(`Server not running. Error: ${e.message}`)
    process.exit(1)
  })
