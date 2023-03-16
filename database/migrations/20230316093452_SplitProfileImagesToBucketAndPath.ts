import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', table => {
        table.string('profileImageBucket').nullable().defaultTo(null).after('description');
        table.string('profileImageFile').nullable().defaultTo(null).after('profileImageBucket');
        table.string('backgroundImageBucket').nullable().defaultTo(null).after('profileImageFile');
        table.string('backgroundImageFile').nullable().defaultTo(null).after('backgroundImageBucket');

        table.dropColumns('profileImage', 'backgroundImage');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', table => {
        table.string('profileImage').nullable().defaultTo(null).after('description');
        table.string('backgroundImage').nullable().defaultTo(null).after('profileImage');
    });

    await knex.table('users').update({
        profileImage: knex.raw('concat("https://", profileImageBucket, ".s3.amazonaws.com/", profileImageFile)'),
        backgroundImage: knex.raw(
            'concat("https://", backgroundImageBucket, ".s3.amazonaws.com/", backgroundImageFile)',
        ),
    });

    await knex.schema.alterTable('users', table => {
        table.dropColumns('profileImageBucket', 'profileImageFile', 'backgroundImageBucket', 'backgroundImageFile');
    });
}

