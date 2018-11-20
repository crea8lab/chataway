require('../config/config')

const path = require('path')
const express = require('express')
const socketIO = require('socket.io')
const http = require('http')

const app = express()
const server = http.createServer(app)
const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT
const uri = process.env.MONGODB_URI
const io = socketIO(server)

app.use(express.static(publicPath))

io.on('connection', (socket) => {
  console.log('New user connected')

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })
})

server.listen(port, () => console.log(`app running on port ${port}`))

module.exports = app