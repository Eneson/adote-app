const express = require('express')
const { celebrate, Segments, Joi } = require('celebrate')

const UserController = require('./controllers/UserController')
const AnimalController = require('./controllers/AnimalController')
const ReportController = require('./controllers/ReportController')
const SessionController = require('./controllers/SessionController')
const login = require('./middleware/login')

const routes = express.Router()
const multerConfig = require('./config/multer');



routes.get('/', (req, res) => {
  return res.json('teste')
})

routes.post('/login', UserController.login)
routes.get('/session', SessionController.index)
routes.post('/forget_password', SessionController.forget_password)
routes.post('/verifyToken', SessionController.verifyToken)
routes.post('/newsenha', UserController.updateSenha)

routes.post('/user/update', UserController.update)

routes.get('/user/:id', UserController.VerificaUser)
routes.get('/user', UserController.index)

routes.post('/user', UserController.create)

routes.delete('/user/:id', login, UserController.delete)

routes.post('/animal', login, multerConfig.upload.array('produto_imagem'), AnimalController.create)

routes.post('/animal/update', login, multerConfig.upload.array('produto_imagem'), AnimalController.update)
routes.post('/animal/update_adotado/:id', login, AnimalController.update_Adotado)

routes.get('/animal', AnimalController.index)

routes.get('/animal/myanimals', login, AnimalController.myAnimals)


routes.delete('/animal/:id', login, celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.number().required(),
  })
}), AnimalController.delete)

routes.post('/report', login, ReportController.create)
routes.get('/report', ReportController.index)
routes.get('/report/:animal_id', ReportController.count)
routes.delete('/report/:id', login, ReportController.delete)

routes.get('*', (req, res) => {
  res.status(404).send('<h1>Error: 404</h1>\n<h2>Rota não encontrada</h2>')
})
routes.post('*', (req, res) => {
  res.status(404).send('<h1>Error: 404</h1>\n<h2>Rota não encontrada</h2>')
})

module.exports = routes
