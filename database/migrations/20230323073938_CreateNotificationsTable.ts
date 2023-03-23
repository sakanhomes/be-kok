import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('notifications', table => {
        table.bigIncrements('id').unsigned().primary().notNullable();
        table.string('publicId').notNullable().unique();
        table.bigInteger('userId').unsigned().notNullable();
        table.string('type').notNullable();
        table.json('data').nullable().defaultTo(null);
        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();
        table.timestamp('readAt').nullable().defaultTo(null);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('notifications');
}

