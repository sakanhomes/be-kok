export default () => ({
    jwtSecret: process.env.JWT_SECRET ? process.env.JWT_SECRET : null,
    expiration: {
        access: process.env.ACCESS_TOKEN_EXPIRATION ? parseInt(process.env.ACCESS_TOKEN_EXPIRATION) : null,
        refresh: process.env.REFRESH_TOKEN_EXPIRATION ? parseInt(process.env.REFRESH_TOKEN_EXPIRATION) : null,
    },
});