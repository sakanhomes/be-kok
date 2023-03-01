import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('account_transactions', table => {
        table.bigIncrements('id').unsigned().primary();
        table.bigInteger('accountId').unsigned().notNullable();
        table.string('type').notNullable();
        table.string('subtype').notNullable();
        table.decimal('amount', 20, 8).notNullable();
        table.bigInteger('videoId').nullable().defaultTo(null);
        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('account_transactions');
}

