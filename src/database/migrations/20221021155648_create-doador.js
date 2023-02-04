exports.up = function(knex) {
    return knex.schema.createTable('doador', function (table) {
        table.increments()
        table.string('name').notNullable()
        table.string('telefone').notNullable().primary()
      })
};

exports.down = function(knex) {
    return knex.schema.dropTable('doador')
};
