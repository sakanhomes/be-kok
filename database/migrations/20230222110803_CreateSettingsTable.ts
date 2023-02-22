import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('settings', (table) => {
        table.string('key').primary();
        table.string('value').nullable();
        table.timestamp('createdAt');
        table.timestamp('updatedAt');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('settings');
}
