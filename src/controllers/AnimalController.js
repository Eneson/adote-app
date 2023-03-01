
const connection  = require('../database/connection')


const { Client } = require('node-scp')



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
        .offset((page - 1) * 10 )
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
    const { Nome, Descricao, DataNasc, Porte, Sexo, Tipo, Vacina, } = request.body
    const  DoadorTelefone  = request.headers.authorization
    
    const foto = filename
    
     await connection('animal').insert({
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
     .then(async (a) => {      
      try {
        const client = await Client({
          host: 'ftp.casadoborracheiroitb.com.br',
          port: 22,
          username: 'casad240',
          password: 'eE!20039807',
        })
        await client.uploadFile(
          './uploads/'+foto,
          './public_html/teste/uploads/'+foto,
          // options?: TransferOptions
        )
        .catch((a) => {
          console.log(a)

        })
        client.close() // remember to close connection after you finish
        return response.status(200).send('ok')
        
      } catch (e) {
        return response.status(500).send({error: 'Erro inesperado'}) 
      }
      
     })
     .catch(() => {
      return response.status(500).send({error: 'Erro inesperado'}) 
     })

   
  },

  async delete(request, response) {    
    const { id } = request.params
    const DoadorTelefone  = request.headers.authorization

    const path = await connection('animal')
    .select('Foto')
    .where('DoadorTelefone', '=',DoadorTelefone)
    .andWhere('id', id)
    .first()
    

    const animal = await connection('animal')
    .select('DoadorTelefone')
    .first()
    .where('DoadorTelefone', '=',DoadorTelefone)

    
    if (animal.DoadorTelefone != DoadorTelefone) {
      return response.status(401).json({ error: 'Operation not permitted.' })
    }
    
    await connection('animal')
      .where('id', id)
      .delete()
      .then(async () => {
        try {
          const client = await Client({
            host: 'ftp.casadoborracheiroitb.com.br',
            port: 22,
            username: 'casad240',
            password: 'eE!20039807',
          })
          await client.unlink('./public_html/teste/uploads/'+path.Foto)
          client.close() // remember to close connection after you finish
          return response.status(200).send('ok')
        } catch (e) {
          return response.status(500).send({error: 'Erro inesperado'}) 
        }
    })

  }
}
