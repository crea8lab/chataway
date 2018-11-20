const moment = require('moment')

module.exports = {
  generateMessage (from, text) {
    return {
      from,
      text,
      createdAt: moment().valueOf()
    }
  },
  generateLocationMessage (from, lat, lng) {
    return {
      from,
      url: `https://www.google.com/maps?q=${lat},${lng}`,
      createdAt: moment().valueOf()
    }
  }
}
