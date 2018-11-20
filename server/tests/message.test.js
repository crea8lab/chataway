const expect = require('expect')

let { generateMessage } = require('../utils/message')

describe('generateMessage', () => {
  it('should generate correct message object', () => {
    let from = 'melv'
    let text = 'we are testing'
    let message = generateMessage(from, text)

    expect(message.createdAt).toBeA('number')
    expect(message).toInclude({ from, text })
  })
})