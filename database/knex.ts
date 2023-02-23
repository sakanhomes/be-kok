import * as path from 'path';
import { config } from 'dotenv';

config({
    path: path.join(process.cwd(), '../.env'),
    override: true,
});

const settings = {
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
    migrations: {
        tableName: 'migrations',
        path: 'database/migrations',
    },
};

module.exports = {
    development: settings,
    production: settings,
    test: settings,
};