const express = require('express')
const cors = require('cors')
const { errors } = require('celebrate')
const routes = require('./routes')
var http = require('http');

const app = express()



// app.use(express.static('public')); 
// app.use(cors())
// app.use(express.json())
// app.get('/adote', (req, res) => res.json('teste'))
app.use(routes)
app.use(errors())
app.use('/uploads', express.static('uploads'));


app.listen(80)
