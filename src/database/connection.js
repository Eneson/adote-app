const knex = require('knex')
const configuration = require('../../knexfile')

const config = process.env.NODE_ENV == 'test' ? configuration.test : configuration.development

const connection = knex(config)
console.log(config)
module.exports = connection
