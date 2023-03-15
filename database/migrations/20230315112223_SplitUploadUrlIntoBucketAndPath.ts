import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('uploads', table => {
        table.string('bucket').nullable().defaultTo(null).after('status');
        table.renameColumn('filename', 'file');
        table.dropColumn('url');
    });

    await knex.table('uploads').update({
        bucket: process.env.AWS_S3_BUCKET,
    });

    await knex.schema.alterTable('uploads', table => {
        table.string('bucket').notNullable().alter();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('uploads', table => {
        table.string('url').nullable().defaultTo(null).after('file');
        table.renameColumn('file', 'filename');
    });

    await knex.table('uploads').update({
        url: knex.raw('concat("https://", bucket, ".s3.amazonaws.com/", filename)'),
    });

    await knex.schema.alterTable('uploads', table => {
        table.string('url').notNullable().alter();
        table.dropColumn('bucket');
    });
}

