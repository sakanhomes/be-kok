import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', table => {
        table.string('name').nullable().defaultTo(null).after('nonce');
        table.string('profileImage').nullable().defaultTo(null).after('name');
        table.string('backgroundImage').nullable().defaultTo(null).after('profileImage');
        table.text('description').nullable().defaultTo(null).after('backgroundImage');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', table => {
        table.dropColumns('name', 'profileImage', 'backgroundImage', 'description');
    });
}

