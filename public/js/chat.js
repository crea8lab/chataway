const socket = io()

// Automatically scroll to bottom when new messages arrive and user is near to the bottom
function scrollToBottom() {
  // selectors
  const messages = $('#messages')
  const newMessage = messages.children('li:last-child')

  // heights
  let clientHeight = messages.prop('clientHeight')
  let scrollTop = messages.prop('scrollTop')
  let scrollHeight = messages.prop('scrollHeight')
  let newMessageHeight = newMessage.innerHeight()
  let lastMessageHeight = newMessage.prev().innerHeight()

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight)
  }
}

// Client connects to the socket
socket.on('connect', function () {
  // Extract user information from the search or query string
  let params = $.deparam(window.location.search)

  socket.emit('join', params, function (err) {
    if (err) { // if error redirect them back to homepage
      alert(err)
      window.location.href = '/'
    } else {
      console.log('no error')
    }
  }) 
})

socket.on('disconnect', function () {
  console.log('Disconnected from server')
}) 

// update the user list when new users join the room
socket.on('updateUserList', function (users) {
  let ol = $('<ol></ol>')

  users.forEach(function (user) {
    ol.append($('<li></li>').text(user))
  })
  
  $('#users').html(ol)
})

// Generate new message
socket.on('newMessage', function (message) {
  let formattedTime = moment(message.createdAt).format('h:mm a')
  let template = $('#message-template').html()
  let html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  })

  $('#messages').append(html)
  scrollToBottom()
})

// Send user location to room
socket.on('newLocationMessage', function (message) {
  let formattedTime = moment(message.createdAt).format('h:mm a')
  let template = $('#location-message-template').html()
  let html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  })
 
  $('#messages').append(html)
  scrollToBottom()
})

// Show when a user is typing
$('[name=message]').on('keyup', function () {
  let textBox = $('[name=message]')
  let informant = $('#isTyping')

  if (textBox.length > 0 && textBox.val() !== '') {
    informant.text('someone is typing...')
  } else {
    informant.text('')
  }
})

// get form element
$('#message-form').on('submit', function (e) {
  e.preventDefault()
  let messageTextbox = $('[name=message]')

  socket.emit('createMessage', {
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

  // disable location button
  locationButton.attr('disabled', 'disabled').text('sending location...')

  navigator.geolocation.getCurrentPosition(function (pos) {
    locationButton.removeAttr('disabled').text('Send Location')
    socket.emit('createLocationMessage', {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    })
  }, function () {
    locationButton.removeAttr('disabled').text('Send Location')
    alert('Unable to fetch location')
  })
})