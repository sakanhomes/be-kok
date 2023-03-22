import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('comment_dislikes', table => {
        table.bigIncrements('id').primary().notNullable();
        table.bigInteger('commentId').unsigned().notNullable();
        table.bigInteger('userId').unsigned().notNullable();
        table.timestamp('dislikedAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('comment_dislikes');
}

