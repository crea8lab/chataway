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

const { generateMessage, generateLocationMessage } = require('./utils/message')
const { isRealString } = require('./utils/validation')
const Users = require('./utils/users')

const users = new Users()

app.use(express.static(publicPath))

io.on('connection', function (socket) {

  socket.on('join', (params, callback) => {
    // join room regardless of capitalization method
    params.room = params.room.toLowerCase()

    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required')
    }

    // user enters a room
    socket.join(params.room)
    users.removeUser(socket.id)
    users.addUser(socket.id, params.name, params.room)

    io.to(params.room).emit('updateUserList', users.getUserList(params.room))

    socket.emit('newMessage', generateMessage('Admin', 'Welcome to chattaway'))
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`))

    callback()
  })

  // Someone is typing
  socket.on('userTyping', (data) => {
    console.log(data)
    // io.emit('isTyping', {msg: 'hi from userTyping'})
    // let user = users.getUser(socket.id)

    // if (user) {
    //   io.to(user.room).emit('isTyping', { user: user.name })
    // }
  })

  // create new message
  socket.on('createMessage', (message, callback) => {
    let user = users.getUser(socket.id)

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text))
    }

    callback()
  })

  // create user location
  socket.on('createLocationMessage', (coords) => {
    let user = users.getUser(socket.id)

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude))
    }
  })

  // on disconnect
  socket.on('disconnect', function () {
    let user = users.removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room))

      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`))
    }
  })
})

server.listen(port, () => console.log(`app running on port ${port}`))

module.exports = app