import * as path from 'path';

const dir = path.join(process.cwd(), 'storage/logs');

export default () => ({
    default: process.env.LOG_CHANNEL ?? 'single',
    channels: {
        single: {
            driver: 'single',
            file: path.join(dir, 'kok.log'),
        },
        daily: {
            driver: 'daily',
            file: path.join(dir, 'kok.log'),
        },
        console: {
            driver: 'console',
        },
    },
});
