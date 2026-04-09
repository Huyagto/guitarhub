module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    clientOrigins: process.env.CLIENT_ORIGINS
        ? process.env.CLIENT_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
        : ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],

    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,

    redisUrl: process.env.REDIS_URL,

    // Gmail OAuth2 (for sending emails)
    emailUser: process.env.EMAIL_USER,
    emailClientId: process.env.CLIENT_ID,
    emailClientSecret: process.env.CLIENT_SECRET,
    emailRedirectUri: process.env.REDIRECT_URI,
    emailRefreshToken: process.env.REFRESH_TOKEN,

    // Google OAuth Login
    googleClientId: process.env.CLIENT_ID,
    googleClientSecret: process.env.CLIENT_SECRET,
    googleLoginUri: process.env.GOOGLE_LOGIN_URI,
};
