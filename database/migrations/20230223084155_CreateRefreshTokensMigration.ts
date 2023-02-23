import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('refresh_tokens', table => {
        table.bigIncrements('id').unsigned();
        table.bigInteger('userId').unsigned().notNullable();
        table.string('token').notNullable().unique();
        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();
        table.timestamp('usedAt').nullable().defaultTo(null);

        table.index('token');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('refresh_tokens');
}

