import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('accounts', table => {
        table.bigIncrements('id').unsigned().primary();
        table.bigInteger('userId').unsigned().notNullable();
        table.decimal('balance', 20, 8).unsigned().notNullable();
        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('accounts');
}

