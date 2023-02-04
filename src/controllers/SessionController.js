const connection = require('../database/connection')

module.exports = {
  async create(request, response) {
    try{
      const { nome, telefone } = request.body
    
      const doador = await connection('doador')
        .where({
          nome: nome,
          telefone: telefone
        })
        .select('nome')
        .first()
        if(doador){
          return response.json(doador)
        }else{
          return response.status(400).json({error: "Usuario e senha não encontrados"})
        }
    }catch(e){
       if(e.message.includes('Undefined binding(s) detected')){
         return response.status(400).json({error: "Usuario e senha não encontrados"})
       }else{
         return response.status(500).json({error: 'Erro inesperado'})
       }
      
    }   
  }
}