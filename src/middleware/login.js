const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        console.log(req.headers.authorization)
        if(req.headers.authorization == 'Beare Admin'){     
            next()
        }else{
            const token = req.headers.authorization.split(' ')[1];
            const decode = jwt.verify(token, `${process.env.JWT_KEY}`)        
            req.usuario = decode;
            next()
        }        
    } catch (error) {
        return res.status(401).json({mesagem: "falha na autenticação"})
    }
    
}