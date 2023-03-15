import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('videos', table => {
        table.string('previewImageBucket').nullable().defaultTo(null).after('previewImage');
        table.string('previewImageFile').nullable().defaultTo(null).after('previewImageBucket');
        table.string('videoBucket').nullable().defaultTo(null).after('video');
        table.string('videoFile').nullable().defaultTo(null).after('videoBucket');
    });

    await knex.table('videos').update({
        previewImageBucket: process.env.AWS_S3_BUCKET,
        previewImageFile: knex.raw('replace(previewImage, "https://kok-dev.s3.amazonaws.com/", "")'),
        videoBucket: process.env.AWS_S3_BUCKET,
        videoFile: knex.raw('replace(video, "https://kok-dev.s3.amazonaws.com/", "")'),
    });

    await knex.schema.alterTable('videos', table => {
        table.string('previewImageBucket').notNullable().alter();
        table.string('previewImageFile').notNullable().alter();
        table.string('videoBucket').notNullable().alter();
        table.string('videoFile').notNullable().alter();
        table.dropColumns('previewImage', 'video');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('videos', table => {
        table.string('previewImage').nullable().defaultTo(null).after('previewImageFile');
        table.string('video').nullable().defaultTo(null).after('videoFile');
    });

    await knex.table('videos').update({
        previewImage: knex.raw('concat("https://", previewImageBucket, ".s3.amazonaws.com/", previewImageFile)'),
        video: knex.raw('concat("https://", videoBucket, ".s3.amazonaws.com/", videoFile)'),
    });

    await knex.schema.alterTable('videos', table => {
        table.string('previewImage').notNullable().alter();
        table.string('video').notNullable().alter();
        table.dropColumns('previewImageBucket', 'previewImageFile', 'videoBucket', 'videoFile');
    });
}

