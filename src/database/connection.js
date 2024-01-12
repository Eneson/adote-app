const connection =  require('knex')({
    client: 'mysql',
    connection: {
      host : 'host4069.hospedameusite.net',
      port : 3306,
      user : 'adotesto_01',
      password : 'eE!20039807',
      database : 'adotesto_01',
    },
})

module.exports = connection
