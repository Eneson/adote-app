
const connection  = require('../database/connection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports = {  
    async login(request,response){
        const { Email, Senha } = request.body
        try{      
          const user = await connection('admin')
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
                        id: user[0].id_user,
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
