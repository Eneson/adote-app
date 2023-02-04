exports.up = function(knex) {
    return knex.schema.createTable('animal', function (table) {
        table.increments().primary()
        table.string('tipo').notNullable()
        table.string('nasc').notNullable()
        table.string('sexo').notNullable()
        table.string('cor').notNullable()
        //table.string('foto').notNullable().primary()

      })
};

exports.down = function(knex) {
    return knex.schema.dropTable('animal')
};
