const { errors } = require('celebrate')
const connection  = require('../database/connection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = {
  async index(request, response) {    
    const { page = 1 } = request.query

    const [count] = await connection('user').count()

    const user = await connection('user')
    .limit(5)
    .offset((page - 1) * 5 )
    .select('*')
    .orderBy('id_user');

    response.header('X-Total-Count', count['count(*)'])    
    return response.json(user)
  },

  async VerificaUser(request, response) {  
    const { id } = request.params  

    const user = await connection('user')
    .where('id_user', id)
    if(user.length>0){
      return response.status(200).send()
    }else{
      return response.status(400).send()

    }
  },

  async create(request, response) {
    const { nome, telefone, email, senha, admin } = request.body
    console.log(request.body)
    if(senha === undefined){
      await connection('user')
      .insert({
        nome: nome,
        telefone: telefone,
        email: email,
        admin: 0
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
        console.log(e) 
        if(e.sqlMessage.includes('Duplicate entry')){
          if(e.sqlMessage.includes('user.telefone')){
            return response.status(400).send({ error: 'Telefone já cadastrado' })
          }else{
            return response.status(400).send({ error: 'E-mail já cadastrado' })
          }
        }
        return response.status(400).send({ error: 'Erro no servidor' })
      })
    }else{
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
              console.log(e) 
              return response.status(400).send({ error: 'Telefone já cadastrado' })
            }else{
              return response.status(400).send({ error: 'E-mail já cadastrado' })
            }
          }
          return response.status(400).send({ error: 'Erro no servidor' })
        })
  
      })         
    }
    

  },

  async createGoogle(request, response) {
    const { email } = request.body
    console.log(request.body)
    var [count] = await connection('user')
    .select('*')
    .where('email', email)
    .count()
    if(count['count(*)']>0){
      console.log(count['count(*)'])
      return response.status(400).send({mensagem: "E-mail cadastrado"})
    }
    return response.status(200).send()
  },
  
  async delete(request, response) {  
    const { id } = request.params
    const Token  = request.headers.authorization
    console.log('request.params')
    console.log(request.params)
    console.log('request.headers.authorization')
    console.log(request.headers.authorization)
    

    
      const user = await connection('user')
      .where('id_user', id)
      .select('id_user')
      .first()

      console.log(user)
      
      if(user== undefined){
        return response.status(401).json({ error: 'Operation not permitted.' })
      }
      if (user.id_user != id) {
        return response.status(401).json({ error: 'Operation not permitted.' })
      }

      await connection('user').where('id_user', id).delete().then((a) => {  
        console.log('then', a)    
        return response.status(204).send()
      }).catch((err) => {
        console.log('err')
        console.log(err)
        return response.status(400).send()
      })
    

  },
  
  async update(request,response){
    const { nome, telefone, email, id_user, admin } = request.body
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
          admin: admin
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
          if(e.sqlMessage.includes('Duplicate entry')){
            if(e.sqlMessage.includes('user.telefone')){
              console.log(e) 
              return response.status(400).send({ error: 'Telefone já cadastrado' })
            }else{
              return response.status(400).send({ error: 'E-mail já cadastrado' })
            }
          }
          return response.status(400).send({ error: 'Erro no servidor' })
        })
    }
    

    
  },
  async updateSenha(request,response){
    console.log(request.body)
    const { senha, token } = request.body
      bcrypt.hash(senha, 10, async (errBcrypt, hash) => {
        if(errBcrypt){return response.status(500).send({error: errBcrypt})}        
        await connection('user')
        .update({
          senhaResetExpires: '',
          senhaResetToken: '',          
          senha: hash
        }).where('senhaResetToken', token)
        .then(async (id_user) => {  
          return response.status(200).send({
            mensagem: "Alterado com sucesso",
          })
            })
        .catch((e) => {    
          if(e.sqlMessage){
            return response.status(400).send({ error: 'Erro ao cadastrar nova senha, tente novamente' })
          }
        })
  
      }) 
    
    

    
  },

  async login(request,response){
    const { Email, Senha,token } = request.body
    console.log(request.body)

    
    if(token != undefined){
      try{      
        const user = await connection('user')
          .where({
            email: Email,
          })
          .select()
  
          if(user.length < 1){
            return response.status(401).json({error: "Falha na autenticação"})
          }

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
                        
      }catch(e){
         if(e.message.includes('Undefined binding(s) detected')){
           return response.status(400).json({error: "Usuario e senha não encontrados"})
         }else{
           return response.status(500).json({error: 'Erro inesperado'})
         }
        
      }
    }else{
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
         if(e.message.includes('Undefined binding(s) detected')){
           return response.status(400).json({error: "Usuario e senha não encontrados"})
         }else{
           return response.status(500).json({error: 'Erro inesperado'})
         }
        
      }
    }
  }
}
