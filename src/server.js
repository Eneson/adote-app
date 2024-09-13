const express = require('express')
const cors = require('cors')
const { errors } = require('celebrate')
const routes = require('./routes')
var http = require('http');

const app = express()

const port = process.env.PORT || 3000;

// app.use(express.static('public')); 
// app.use(cors())
app.use(function (request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.json())
app.use('/uploads', express.static('uploads'));
// app.get('/adote', (req, res) => res.json('teste'))
app.use(routes)
app.use(errors())

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

//app.listen(port)
