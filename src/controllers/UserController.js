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
    const { nome, telefone, email, senha, admin } = request.body

    
    bcrypt.hash(senha, 10, async (errBcrypt, hash) => {
      if(errBcrypt){return response.status(500).send({error: errBcrypt})}
      
      await connection('user')
      .insert({
        nome: nome,
        telefone: telefone,
        email: email,
        senha: hash,
        admin: admin
      })
      .then(async (id_user) =>{  
        const user = await connection('user')
        .where({
          id_user: id_user[0],
        })
        .select()
        const token = jwt.sign({
          email: user[0].email,
          id_user: user[0].id_user,
          nome: user[0].nome,
          telefone: user[0].telefone,
          admin: user[0].admin
        }, `${process.env.JWT_KEY}`,{
          expiresIn: "1y"
        })
        return response.status(200).send({
          mensagem: "Autenticado com sucesso",
          token: token
        })
          })
      .catch((e) => {   
        if(e.sqlMessage.includes('Duplicate entry')){
          if(e.sqlMessage.includes('user.telefone')){
            return response.status(400).send({ error: 'Telefone já cadastrado' })
          }else{
            return response.status(400).send({ error: 'Email já cadastrado' })
          }
        }
        return response.status(400).send({ error: 'Erro no servidor' })
      })

    })         
     

  },

  async delete(request, response) {    
    const { telefone } = request.params
    const UserTelefone  = request.headers.authorization

    if(UserTelefone == "Beare Admin"){
      await connection('user').where('telefone', request.body.telefone).delete()
        .then(() => {
          return response.status(204).send()
        })
        .catch(() => {
            return response.status(400).send()
        })
    }else{
      const user = await connection('user')
      .where('telefone', UserTelefone)
      .select('telefone')
      .first()

      if(user== undefined){
        return response.status(401).json({ error: 'Operation not permitted.' })
      }
      if (user.telefone != UserTelefone) {
        return response.status(401).json({ error: 'Operation not permitted.' })
      }

      await connection('user').where('telefone', telefone).delete().then(() => {      
        return response.status(204).send()
      }).catch(() => {
        return response.status(400).send()
      })
    }

    


  },
  
  async update(request,response){
    console.log(request.body)
    const { nome, telefone, email, id_user } = request.body
    if(request.body.senha){
      const senha = request.body.senha
      bcrypt.hash(senha, 10, async (errBcrypt, hash) => {
        if(errBcrypt){return response.status(500).send({error: errBcrypt})}        
        await connection('user')
        .update({
          nome: nome,
          telefone: telefone,
          email: email,
          senha: hash
        }).where('id_user', id_user)
        .then(async (id_user) => {  
          const user = await connection('user')
          .where({
            email: email,
          })
          .select()
          const token = jwt.sign({
            email: user[0].email,
            id_user: user[0].id_user,
            nome: user[0].nome,
            telefone: user[0].telefone
          }, `${process.env.JWT_KEY}`,{
            expiresIn: "1y"
          })
          return response.status(200).send({
            mensagem: "Autenticado com sucesso",
            token: token
          })
            })
        .catch((e) => {    
          if(e.sqlMessage){
            return response.status(400).send({ error: 'Usuario já existe' })
          }
        })
  
      }) 
    }else{
        await connection('user')
        .update({
          nome: nome,
          telefone: telefone,
          email: email,
        }).where('id_user', id_user)
        .then(async () => {  
          const user = await connection('user')
          .where({
            email: email,
          })
          .select()
          const token = jwt.sign({
            email: user[0].email,
            id_user: user[0].id_user,
            nome: user[0].nome,
            telefone: user[0].telefone
          }, `${process.env.JWT_KEY}`,{
            expiresIn: "1y"
          })
          return response.status(200).send({
            mensagem: "Autenticado com sucesso",
            token: token
          })
        })
        .catch((e) => {    
          if(e.sqlMessage){
            return response.status(400).send({ error: 'ERRO' })
          }
        })
    }
    

    
  },

  async login(request,response){
    const { Email, Senha } = request.body
    try{      
      const user = await connection('user')
        .where({
          email: Email,
        })
        .select()

        if(user.length < 1){
          return response.status(401).json({error: "Falha na autenticação"})
        }
        bcrypt.compare(Senha, user[0].senha, (err, result) => {
          if(err){            
            return response.status(401).json({error: "Falha na autenticação"})
          }
          if(result){
            const token = jwt.sign({
              email: user[0].email,
              id_user: user[0].id_user,
              nome: user[0].nome,
              telefone: user[0].telefone,
              admin: user[0].admin
            }, `${process.env.JWT_KEY}`,{
              expiresIn: "1y"
            })
            return response.status(200).send({
              mensagem: "Autenticado com sucesso",
              token: token
            })
          }
          
          return response.status(401).json({error: "Falha na autenticação"})
        })
    }catch(e){
      console.log(e)
       if(e.message.includes('Undefined binding(s) detected')){
         return response.status(400).json({error: "Usuario e senha não encontrados"})
       }else{
         return response.status(500).json({error: 'Erro inesperado'})
       }
      
    }  
  }
}
