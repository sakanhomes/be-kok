import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('subscriptions', table => {
        table.bigIncrements('id').primary().notNullable();
        table.bigInteger('userId').unsigned().notNullable();
        table.bigInteger('subscriberId').unsigned().notNullable();
        table.timestamp('subscribedAt').notNullable();
    });

    await knex.schema.alterTable('users', table => {
        table.renameColumn('followersAmount', 'subscribersAmount');
        table.renameColumn('followingsAmount', 'subscriptionsAmount');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('subscriptions');

    await knex.schema.alterTable('users', table => {
        table.renameColumn('subscribersAmount', 'followersAmount');
        table.renameColumn('subscriptionsAmount', 'followingsAmount');
    });
}

