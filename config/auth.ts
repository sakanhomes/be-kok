export default () => ({
    jwtSecret: process.env.JWT_SECRET,
    expiration: {
        access: process.env.ACCESS_TOKEN_EXPIRATION,
        refresh: process.env.REFRESH_TOKEN_EXPIRATION,
    },
});