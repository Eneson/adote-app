const jwt = require('jsonwebtoken');

module.exports = {
  async index(request, response) {
      try {
          const token = request.headers.authorization.split(' ')[1];
            console.log(token)
          const decode = jwt.verify(token, `${process.env.JWT_KEY}`)           
          console.log(decode)       
          request.usuario = decode;
          return response.status(200).send(decode)
      } catch (error) {
        console.log(error)
          return response.status(401).send({error: error})
      }       
  }
}