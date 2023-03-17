import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('playlists', table => {
        table.bigIncrements('id').unsigned().primary().notNullable();
        table.string('publicId').unique().notNullable();
        table.bigInteger('userId').unsigned().notNullable();
        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('playlists');
}

