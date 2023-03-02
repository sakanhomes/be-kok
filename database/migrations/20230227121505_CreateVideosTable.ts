import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('videos', table => {
        table.bigIncrements('id').unsigned().primary();
        table.string('publicId').notNullable().unique();
        table.integer('categoryId').unsigned().notNullable();
        table.bigInteger('userId').unsigned().notNullable();
        table.string('title').notNullable();
        table.string('duration').notNullable();
        table.text('description').nullable().defaultTo(null);
        table.string('previewImage').notNullable();
        table.string('video').notNullable();
        table.integer('viewsAmount').unsigned().notNullable().defaultTo(0);
        table.integer('likesAmount').unsigned().notNullable().defaultTo(0);
        table.integer('commentsAmount').unsigned().notNullable().defaultTo(0);
        table.boolean('isPublic').notNullable().defaultTo(true);
        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('videos');
}

