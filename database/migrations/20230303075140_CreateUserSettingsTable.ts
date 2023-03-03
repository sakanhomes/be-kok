import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('user_settings', (table) => {
        table.bigInteger('userId').unsigned().notNullable();
        table.string('key').notNullable();
        table.string('value').nullable();
        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();

        table.unique(['userId', 'key']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('user_settings');
}

