const express = require('express')
const cors = require('cors')
const { errors } = require('celebrate')
const routes = require('./routes')

const app = express()

app.get('/app', (req, res) => res.json('teste'))
// app.use(cors())
// app.use(express.json())
// app.use(routes)
// app.use(errors())
// app.use(express.static('public')); 
// app.use('/uploads', express.static('uploads'));

module.exports = app
