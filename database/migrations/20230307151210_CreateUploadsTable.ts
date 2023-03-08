import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('uploads', table => {
        table.string('id').primary().notNullable();
        table.string('owner').notNullable();
        table.tinyint('type').unsigned().notNullable();
        table.tinyint('status').unsigned().notNullable();
        table.string('filename').notNullable();
        table.bigInteger('chunkSize').unsigned().nullable().defaultTo(null);
        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();
        table.timestamp('lastChunkAt').nullable().defaultTo(null);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('uploads');
}

