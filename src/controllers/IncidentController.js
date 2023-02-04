const connection = require('../database/connection')

module.exports = {
  async index(request, response) {
    const { page = 1 } = request.query

    const [count] = await connection('animal').count()

    const animal = await connection('animal')
      .join('doador', 'doador.telefone', '=', 'animal.DoadorTelefone')
      .limit(10)
      .offset((page - 1) * 5 )
      .select([
        'animal.*',
        'doador.nome',
        'doador.telefone',
      ])

    response.header('X-Total-Count', count['count(*)'])

    return response.json(animal)
  },

  async create(request, response) {
    const { tipo, nasc, cor, sexo } = request.body
    const  doador_telefone  = request.headers.authorization
    
    const [id] = await connection('animal').insert({
      tipo,
      nasc,
      cor,
      sexo,
      doador_telefone,
    })

    return response.json({ id })
  },

  async delete(request, response) {
    const { id } = request.params
    const doador_telefone  = request.headers.authorization

    const animal = await connection('animal')
      .where('id', id)
      .select('doador_telefone')
      .first()

    if (animal.doador_telefone != doador_telefone) {
      return response.status(401).json({ error: 'Operation not permitted.' })
    }

    await connection('animal').where('id', id).delete()

    return response.status(204).send()
  }
}