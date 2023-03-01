// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      host : 'casadoborracheiroitb.com.br',
      port : 3306,
      user : 'casad240',
      password : 'eE!20039807',
      database : 'casad240_adote-app',
    },


    // client: 'sqlite3',
    // connection: {
    //   //filename: './src/database/db2.sqlite'
    //   filename: 'https://casadoborracheiroitb.com.br/teste/database/db2.sqlite'
    // },
    // migrations: {
    //   directory: 'https://casadoborracheiroitb.com.br/teste/database/db2.smigrations'
    // },
    // useNullAsDefault: true,
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: './src/database/test.sqlite'
    },
    migrations: {
      directory: './src/database/migrations'
    },
    useNullAsDefault: true,
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
