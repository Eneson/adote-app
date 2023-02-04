const connection  = require('../database/connection')

module.exports = {
  async index(request, response) {
  const doador = await connection('doador').select('*')

  return response.json(doador)
 },

  async create(request, response) {
    const { nome, telefone } = request.body

    await connection('doador').insert({
      nome,
      telefone,
    })

    return response.json('sucesso')
  },

  async delete(request, response) {    
    const { telefone } = request.params
    const DoadorTelefone  = request.headers.authorization

    const doador = await connection('doador')
      .where('telefone', DoadorTelefone)
      .select('telefone')
      .first()
      .catch(() => {
       
      })
    if(doador== undefined){
      return response.status(401).json({ error: 'Operation not permitted.' })
    }
    if (doador.telefone != DoadorTelefone) {
      return response.status(401).json({ error: 'Operation not permitted.' })
    }

    await connection('doador').where('telefone', telefone).delete()

    return response.status(204).send()
  },
  async update(request,response){
    const { nome, telefone } = request.body
    const DoadorTelefone  = request.headers.authorization

    await connection('doador').update({
      nome,
      telefone,
    }).where('telefone', DoadorTelefone)

    await connection('animal').update({
      'DoadorTelefone': telefone
    })
    .select('DoadorTelefone').where('DoadorTelefone', DoadorTelefone)

    return response.json('sucesso')
  }
}
