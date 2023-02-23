import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', table => {
        table.bigIncrements('id').unsigned();
        table.string('address').notNullable().unique();
        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users');
}

