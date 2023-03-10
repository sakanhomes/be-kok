export default () => ({
    name: process.env.APP_NAME ?? 'KOO',
    env: process.env.ENV ?? 'local',
    url: process.env.APP_URL,
    domain: process.env.APP_DOMAIN,
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 8000,
    uploadsPort: process.env.UPLOADS_PORT ? parseInt(process.env.UPLOADS_PORT) : 8001,
});
