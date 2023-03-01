import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', table => {
        table.integer('videosAmount').unsigned().notNullable().defaultTo(0).after('description');
        table.integer('followersAmount').unsigned().notNullable().defaultTo(0).after('videosAmount');
        table.integer('followingsAmount').unsigned().notNullable().defaultTo(0).after('followersAmount');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', table => {
        table.dropColumns('videosAmount', 'followersAmount', 'followingsAmount');
    });
}
