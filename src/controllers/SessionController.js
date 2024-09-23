const jwt = require('jsonwebtoken');

module.exports = {
  async index(request, response) {
      try {
          console.log(request.headers.authorization)
          const token = request.headers.authorization.split(' ')[1];
          const decode = jwt.verify(token, `${process.env.JWT_KEY}`)         
          request.usuario = decode;
          return response.status(200).send(decode)
      } catch (error) {
          return response.status(401).send({error: error})
      }       
  }
}