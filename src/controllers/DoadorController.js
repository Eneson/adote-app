const connection  = require('../database/connection')
const SessionController = require('./SessionController.js');

module.exports = {
  async index(request, response) {
    const doador = await connection('doador').select('*')

    return response.json(doador)
  },

  async create(request, response) {
    const { nome, telefone } = request.body
    
    // const doador = await connection('doador')
    //   .where('telefone', telefone)
    //   .select('telefone')
    //   .first()
      
    
      await connection('doador')
      .insert({
        nome: nome,
        telefone: telefone,
      })
      .then(async () =>{
          await connection('doador').where({
            nome: nome,
            telefone: telefone
          })
          .select('nome','telefone','id_doador')
          .first()
          .then((res) => {
            const normalObj = Object.assign({}, res)
            return response.status(200).send(normalObj)
          })
          })
      .catch((e) => {
        
        if(e.sqlMessage){
          return response.status(400).send({ error: 'Usuario já existe' })
        }
      })


      // if(newDoador[0]){
      //   return response.status(200).send(newDoador[0])
      // }else{
      //   return response.status(500).send({error: 'Erro inesperado'})
      // }
      
     

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

    await connection('doador').where('telefone', telefone).delete().then(async () => {
      await connection('animal')
      .where('DoadorTelefone', telefone)
      .delete()
    })

    return response.status(204).send()
  },
  async update(request,response){
    const { nome, telefone } = request.body
    const DoadorTelefone  = request.headers.authorization

    await connection('doador').update({
      nome,
      telefone,
    }).where('telefone', DoadorTelefone).then(async (a) => {
      //console.log(request.body)
      await SessionController.create(request, response, request.body);
    }).catch(()=> {
      return response.status(500).send({error: 'Erro inesperado'}) 
    })

  }
}
