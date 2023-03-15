import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('views_history', table => {
        table.bigIncrements('id').primary().notNullable();
        table.bigInteger('videoId').unsigned().notNullable();
        table.bigInteger('userId').unsigned().notNullable();
        table.timestamp('viewedAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('views_history');
}

