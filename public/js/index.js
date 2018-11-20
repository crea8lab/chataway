const socket = io()

socket.on('connect', function () {
  console.log('Connected to server')
})

socket.on('disconnect', function () {
  console.log('Disconnected from server')
}) 

socket.on('newMessage', function (message) {
  let li = $('<li></li>')
  li.text(`${message.from}: ${message.text}`)

  $('#messages').append(li)
})

socket.on('newLocationMessage', function (message) {
  let li = $('<li></li>')
  let a = $('<a target="_blank">My current location</a>')

  li.text(`${message.from}: `)
  a.attr('href', message.url)

  li.append(a)
  $('#messages').append(li)
})

// get form element
$('#message-form').on('submit', function (e) {
  e.preventDefault()
  let messageTextbox = $('[name=message]')

  socket.emit('createMessage', {
    from: 'User',
    text: messageTextbox.val()
  }, function () {
    // clear input field
    messageTextbox.val('')
  })
})

// get location
const locationButton = $('#send_location')

locationButton.on('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser')
  }

  navigator.geolocation.getCurrentPosition(function (pos) {
    socket.emit('createLocationMessage', {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    })
  }, function () {
    alert('Unable to fetch location')
  })
})