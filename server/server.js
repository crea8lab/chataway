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

const { generateMessage } = require('./utils/message')

app.use(express.static(publicPath))

io.on('connection', function (socket) {
  console.log('New user connected')

  socket.emit('newMessage', generateMessage('Admin', 'Welcome to chattaway'))

  // Broadcast new user joined
  socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined'))

  socket.on('createMessage', (message, callback) => {
    console.log('createMessage', message)

    io.emit('newMessage', generateMessage(message.from, message.text))

    callback('recieved')
  })

  // on disconnect
  socket.on('disconnect', function () {
    console.log('Client disconnected')
  })
})

server.listen(port, () => console.log(`app running on port ${port}`))

module.exports = app