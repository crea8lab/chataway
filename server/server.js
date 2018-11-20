require('../config/config')

const path = require('path')
const express = require('express')

const app = express()
const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT
const uri = process.env.MONGODB_URI

app.use(express.static(publicPath))

app.listen(port, () => console.log(`app running on port ${port}`))

module.exports = app