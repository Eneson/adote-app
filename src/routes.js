const express = require('express')
const { celebrate, Segments, Joi } = require('celebrate')

const DoadorController = require('./controllers/DoadorController')
const IncidentController = require('./controllers/IncidentController')
const InicialController = require('./controllers/InicialController')
const SessionController = require('./controllers/SessionController')
const AnimalController = require('./controllers/AnimalController')
const ImageController = require('./controllers/ImageController')

const routes = express.Router()

const multerConfig = require('./config/multer');


routes.get('/', InicialController.index)

routes.get('/adote', InicialController.index)
routes.post('/sessions', SessionController.create)
routes.post('/doador/update',celebrate({
  [Segments.BODY]: Joi.object().keys({
    nome: Joi.string().required(),
    telefone: Joi.string().required().min(10).max(11),
  })
}), DoadorController.update)
routes.get('/doador', DoadorController.index)
routes.post('/doador', celebrate({
  [Segments.BODY]: Joi.object().keys({
    nome: Joi.string().required(),
    telefone: Joi.string().required().min(9).max(11),
  })
}), DoadorController.create)
routes.delete('/doador/:telefone', celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    telefone: Joi.number().required(),
  })
}), DoadorController.delete)

routes.post('/animal', multerConfig.upload.single('produto_imagem') ,AnimalController.create)

routes.get('/animal', celebrate({
  [Segments.QUERY]: Joi.object().keys({
    telefone: Joi.string(),
    page: Joi.number(),
  })
}),AnimalController.index)

routes.get('/:path', ImageController.getImage)

routes.delete('/animal/:id', celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.number().required(),
  })
}), AnimalController.delete)


module.exports = routes
