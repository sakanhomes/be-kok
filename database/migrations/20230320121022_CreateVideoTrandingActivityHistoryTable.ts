import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('video_tranding_activity_history', table => {
        table.bigIncrements('id').primary().notNullable();
        table.bigInteger('videoId').unsigned().notNullable();
        table.bigInteger('userId').unsigned().nullable();
        table.timestamp('createdAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('video_tranding_activity_history');
}
