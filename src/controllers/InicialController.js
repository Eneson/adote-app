const connection = require('../database/connection')

module.exports = {
  async index(request, response) {
    console.log('aaaaa')
    return response.json('teste')

  }
}