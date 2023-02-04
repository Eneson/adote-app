const connection = require('../database/connection')

module.exports = {
  async index(request, response) {
    const doador_telefone = request.headers.authorization

    const incidents = await connection('animal').where('doador_telefone', doador_telefone)
    .select('*')

  return response.json(incidents)
  }
}