const connection  = require('../database/connection')

module.exports = {
  async index(request, response) {
    if(request.query.telefone){
      const doador = await connection('animal')
      .select('*')
      .where('DoadorTelefone', '=',request.query.telefone)
      return response.json(doador)
    }else {
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
    }
 },

  async create(request, response) {
    const { filename } = request.file 
    const { Nome, Descricao, DataNasc, Porte, Sexo, Tipo, Vacina } = request.body
    const  DoadorTelefone  = request.headers.authorization
    
    const foto = filename
    
     const [id] = await connection('animal').insert({
       Nome,
       Descricao,
       DataNasc,
       Porte,
       Sexo,
       DoadorTelefone,
       foto,
       Tipo,
       Vacina
     })

    return response.json(id)
  },

  async delete(request, response) {    
    const { id } = request.params
    const DoadorTelefone  = request.headers.authorization

    const path = await connection('animal')
    .select('Foto')
    .first()
    .where('DoadorTelefone', '=',DoadorTelefone)
    

    const animal = await connection('animal')
      .where('id', id)
      .select('DoadorTelefone')
      .first()
    
    if (animal.DoadorTelefone != DoadorTelefone) {
      return response.status(401).json({ error: 'Operation not permitted.' })
    }
    await connection('animal').where('id', id).delete().then(() => {
      const fs = require('fs')
      fs.unlink('uploads/'+path.Foto, (err) => {
        if (err) throw err;
      })
    })

    return response.status(204).send()
  }
}
