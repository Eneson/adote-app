const { verifyToken,clerkClient } = require('@clerk/express')



module.exports = async (req, res, next) => {
  const list = await clerkClient.to
  try {
    const token = req.body
    console.log('token')
    console.log(token)
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Verifica e decodifica o token
    console.log('session')
    const session = await verifyToken({token: token, options});
    console.log(session)
    if (session) {
      req.user = session.user; // Informação do usuário decodificada
      next(); // Continue para a próxima middleware
    } else {
      res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Erro ao verificar o token' });
  }
}