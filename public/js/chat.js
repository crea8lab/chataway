const socket = io()

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

socket.on('connect', function () {
  let params = $.deparam(window.location.search)

  socket.emit('join', params, function (err) {
    if (err) {
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

socket.on('updateUserList', function (users) {
  let ol = $('<ol></ol>')

  users.forEach(function (user) {
    ol.append($('<li></li>').text(user))
  })
  
  $('#users').html(ol)
})

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