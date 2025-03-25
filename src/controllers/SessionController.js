const jwt = require('jsonwebtoken');
const transport = require('../modules/mailer')
const connection  = require('../database/connection')


module.exports = {
  async index(request, response) {
      try {
          const token = request.headers.authorization.split(' ')[1];
          const decode = jwt.verify(token, `${process.env.JWT_KEY}`)         
          request.usuario = decode;
          console.log(decode)
          return response.status(200).send(decode)
      } catch (error) {
          return response.status(401).send({error: error})
      }       
  },
  
  //enviar token com validade para o usuario. o usuario deve armazenar no banco de dados para verificação posterior
  async forget_password(request, response) {
    const { email } = request.body
    console.log(email)
    try {        
        const token = Math.floor(1000 + Math.random() * 9000).toString();
        const validade = Date.now() + 3600000; // 1 hora em milissegundos 

        const user = await connection('user')
                        .where('email', email)
                        .select('email')
                        .first()

      if(!user){
        return response.status(401).json({mesagem: "Usuario não encontrado"})
      }
      
        await connection('user')
        .update({
          senhaResetToken: token,
          senhaResetExpires: validade
        }).where('email', email)
        .then(async (id_user) =>{  
          console.log(validade)
            const info = await transport.sendMail({
              from: "adote <hello@asdote.online>", // sender address
              to: email, // list of receivers
              subject: "Recuperar senha", // Subject line
              text: "Codigo para recuperar senha: "+token, // plain text body
            });
              
            console.log("Message sent: %s", info);


            return response.status(200).send({token,validade})
        })
      .catch((e) => {  })

    } catch (error) {
        console.error(error)
        return response.status(401).send({error: error})
    }       
  },
  
  async verifyToken(request, response) {    
    try {
      const { token } = request.body
      console.log(token)
      const validade = await connection('user')
                          .where('senhaResetToken', token)
                          .select('senhaResetExpires','senhaResetToken')
                          .first()
      if(!validade){
        return response.status(401).send({error: 'Token Invalido'})
      }else{
        const dateNow = Date.now()    
        
        if((validade.senhaResetExpires-dateNow)>3600000){
          return response.status(401).send({error: 'Token Expirou'})
        }else{
          if(validade.senhaResetToken==token){
            return response.status(200).send({error: 'Token valido'})
          }else{
            return response.status(401).send({error: 'Token Invalido'})
          }
        }
      }
  
      } catch (error) {
          console.error(error)
          return response.status(401).send({error: error})
      }
  },

}