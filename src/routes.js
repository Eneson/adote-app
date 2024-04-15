const express = require('express')
const { celebrate, Segments, Joi } = require('celebrate')

const UserController = require('./controllers/UserController')
const InicialController = require('./controllers/InicialController')
const AnimalController = require('./controllers/AnimalController')
const ReportController = require('./controllers/ReportController')
const login = require('./middleware/login')

const routes = express.Router()
const multerConfig = require('./config/multer');



routes.get('/', InicialController.index)

routes.get('/adote', InicialController.index)

routes.post('/login', UserController.login)

routes.post('/user/update',celebrate({
  [Segments.BODY]: Joi.object().keys({
    nome: Joi.string().required(),
    telefone: Joi.string().required().min(8).max(13),
    email: Joi.string().email().required(),
    senha: Joi.string().required().min(8)
  })
}), UserController.update)

routes.get('/user', UserController.index)

routes.post('/user', celebrate({
  [Segments.BODY]: Joi.object().keys({
    nome: Joi.string().required(),
    telefone: Joi.string().required().min(8).max(13),
    email: Joi.string().email().required(),
    senha: Joi.string().required().min(8)
  })
}), UserController.create)

routes.delete('/user/:telefone', login, celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    email: Joi.string().email().required(),
    senha: Joi.string().required().min(8),
  })
}), UserController.delete)

routes.post('/animal', login, multerConfig.upload.single('produto_imagem'), AnimalController.create)

routes.get('/animal', celebrate({
  [Segments.QUERY]: Joi.object().keys({
    telefone: Joi.string(),
    page: Joi.number(),
  })
}),AnimalController.index)


routes.delete('/animal/:id', login, celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.number().required(),
  })
}), AnimalController.delete)

routes.post('/report', login, ReportController.create)

routes.get('*', (req, res) => {
  res.status(404).send('<h1>Error: 404</h1>\n<h2>Rota não encontrada</h2>')
})
routes.post('*', (req, res) => {
  res.status(404).send('<h1>Error: 404</h1>\n<h2>Rota não encontrada</h2>')
})

module.exports = routes
