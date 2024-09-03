const express = require('express')
const cors = require('cors')
const { errors } = require('celebrate')
const routes = require('./routes')

const app = express()

app.get('/app', (req, res) => res.json('teste'))

module.exports = app
