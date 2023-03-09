import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('upload_parts', (table) => {
        table.bigInteger('uploadId').unsigned().notNullable();
        table.integer('part').unsigned().notNullable();
        table.tinyint('status').unsigned().notNullable();
        table.timestamp('createdAt').notNullable();
        table.timestamp('updatedAt').notNullable();

        table.primary(['uploadId', 'part']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('upload_parts');
}

