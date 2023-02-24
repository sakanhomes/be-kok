import { table } from 'console';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', table => {
        table.string('nonce').nullable().defaultTo(null).after('address');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', table => {
        table.dropColumn('nonce');
    });
}

