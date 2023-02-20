export default () => ({
    name: process.env.APP_NAME ?? 'KOO',
    env: process.env.APP_ENV ?? 'dev',
    url: process.env.APP_URL,
    port: process.env.APP_LISTEN ? parseInt(process.env.APP_LISTEN) : 8000,
});
