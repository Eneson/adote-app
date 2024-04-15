const { errors } = require('celebrate')
const connection  = require('../database/connection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = {
  async index(request, response) {
    const user = await connection('user').select('*')

    return response.json(user)
  },

  async create(request, response) {
    const { nome, telefone, email, senha } = request.body
    console.log(request.body)
    bcrypt.hash(senha, 10, async (errBcrypt, hash) => {
      if(errBcrypt){return response.status(500).send({error: errBcrypt})}
      
      await connection('user')
      .insert({
        nome: nome,
        telefone: telefone,
        email: email,
        senha: hash
      })
      .then(async (res) =>{    
            console.log(res)
            const data = {
              nome: nome,
              telefone: telefone,
              email: email,
              senha: hash
            }
            return response.status(200).send(data)
          })
      .catch((e) => {    
        console.log(e)    
        if(e.sqlMessage){
          return response.status(400).send({ error: 'Usuario já existe' })
        }
      })

    })         
     

  },

  async delete(request, response) {    
    const { telefone } = request.params
    const UserTelefone  = request.headers.authorization

    const user = await connection('user')
      .where('telefone', UserTelefone)
      .select('telefone')
      .first()
      .catch(() => {
       
      })
    if(user== undefined){
      return response.status(401).json({ error: 'Operation not permitted.' })
    }
    if (user.telefone != UserTelefone) {
      return response.status(401).json({ error: 'Operation not permitted.' })
    }

    await connection('user').where('telefone', telefone).delete().then(async () => {
      await connection('animal')
      .where('UserTelefone', telefone)
      .delete()
    })

    return response.status(204).send()
  },
  async update(request,response){
    const { nome, telefone } = request.body
    const UserTelefone  = request.headers.authorization

    await connection('user').update({
      nome,
      telefone,
    }).where('telefone', UserTelefone)

    await connection('animal').update({
      'UserTelefone': telefone
    })
    .select('UserTelefone').where('UserTelefone', UserTelefone)

    return response.json('sucesso')
  },

  async login(request,response){
    const { email, senha } = request.body
    try{      
      const user = await connection('user')
        .where({
          email: email,
        })
        .select()

        if(user.length < 1){
          return response.status(401).json({error: "Falha na autenticação"})
        }
        bcrypt.compare(senha, user[0].senha, (err, result) => {
          console.log(senha)
          console.log(user[0].senha)

          if(err){            
            return response.status(401).json({error: "Falha na autenticação"})
          }

          if(result){
            const token = jwt.sign({
              email: user[0].email,
              id_user: user[0].id_user,
              nome: user[0].nome,
              telefone: user[0].telefone
            }, `${process.env.JWT_KEY}`,{
              expiresIn: "1h"
            })
            return response.status(200).send({
              mensagem: "Autenticado com sucesso",
              token: token
            })
          }
          
          console.log('aaaaaaaa')
          return response.status(401).json({error: "Falha na autenticação"})
        })
    }catch(e){
       if(e.message.includes('Undefined binding(s) detected')){
         return response.status(400).json({error: "Usuario e senha não encontrados"})
       }else{
         return response.status(500).json({error: 'Erro inesperado'})
       }
      
    }  
  }
}
