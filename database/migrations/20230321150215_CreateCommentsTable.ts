import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('comments', table => {
        table.bigIncrements('id').primary().notNullable();
        table.bigInteger('repliedCommentId').unsigned().nullable().defaultTo(null);
        table.string('publicId').notNullable().unique();
        table.bigInteger('videoId').unsigned().notNullable();
        table.text('content').notNullable();
        table.bigInteger('userId').unsigned().notNullable();
        table.bigInteger('likesAmount').unsigned().defaultTo(0);
        table.bigInteger('dislikesAmount').unsigned().defaultTo(0);
        table.bigInteger('repliesAmount').unsigned().defaultTo(0);
        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('comments');
}

