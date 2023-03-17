import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('playlist_videos', table => {
        table.bigIncrements('id').unsigned().primary().notNullable();
        table.bigInteger('playlistId').unsigned().notNullable();
        table.bigInteger('videoId').unsigned().notNullable();
        table.timestamp('addedAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('playlist_videos');
}

