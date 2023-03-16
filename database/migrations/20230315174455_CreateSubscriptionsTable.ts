import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('subscriptions', table => {
        table.bigIncrements('id').primary().notNullable();
        table.bigInteger('userId').unsigned().notNullable();
        table.bigInteger('subscriberId').unsigned().notNullable();
        table.timestamp('subscribedAt').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('subscriptions');
}

