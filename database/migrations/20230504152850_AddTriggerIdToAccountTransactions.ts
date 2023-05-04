import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('account_transactions', (table) => {
        table.bigInteger('triggerId').unsigned().nullable().defaultTo(null).after('amount');
    });
}
export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('account_transactions', (table) => {
        table.dropColumn('triggerId');
    });
}
