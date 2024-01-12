// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      host : 'host4069.hospedameusite.net',
      port : 3306,
      user : 'adotesto_01',
      password : 'eE!20039807',
      database : 'adotesto_01',
    },

  },

  test: {
    client: 'mysql',
    connection: {
      host : 'host4069.hospedameusite.net',
      port : 3306,
      user : 'adotesto_01',
      password : 'eE!20039807',
      database : 'adotesto_01',
    },
  },

  /*staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }  */
};
