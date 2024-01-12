const config = require('../../knexfile')
const knex = require('knex')(config)
const connection = knex
module.exports = connection
