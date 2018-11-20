const socket = io()

socket.on('connect', function () {
  console.log('Connected to server')

  socket.emit('createMessage', {
    from: 'scala',
    text: 'Hey, I am having fun'
  })
})

socket.on('disconnect', function () {
  console.log('Disconnected from server')
}) 

socket.on('newMessage', function (message) {
  console.log('New Message', message)
})