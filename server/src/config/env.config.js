module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    appBaseUrl: process.env.APP_BASE_URL || `http://127.0.0.1:${process.env.PORT || 3000}`,
    customerAppUrl: process.env.CUSTOMER_APP_URL || 'http://127.0.0.1:3001',
    clientOrigins: process.env.CLIENT_ORIGINS
        ? process.env.CLIENT_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
        : [
            'http://127.0.0.1:3001',
            'http://127.0.0.1:3002',
            'http://127.0.0.1:3003',
        ],

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
    googleLoginUri: process.env.GOOGLE_LOGIN_URI || `${process.env.APP_BASE_URL || `http://127.0.0.1:${process.env.PORT || 3000}`}/api/auth/google/callback`,

    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

    vnpayTmnCode: process.env.VNPAY_TMN_CODE,
    vnpayHashSecret: process.env.VNPAY_HASH_SECRET,
    vnpayPaymentUrl: process.env.VNPAY_PAYMENT_URL,
    vnpayReturnUrl: process.env.VNPAY_RETURN_URL,

    momoPartnerCode: process.env.MOMO_PARTNER_CODE,
    momoAccessKey: process.env.MOMO_ACCESS_KEY,
    momoSecretKey: process.env.MOMO_SECRET_KEY,
    momoPaymentUrl: process.env.MOMO_PAYMENT_URL,
    momoReturnUrl: process.env.MOMO_RETURN_URL,
    momoIpnUrl: process.env.MOMO_IPN_URL,

    zaloPayAppId: process.env.ZALOPAY_APP_ID,
    zaloPayKey1: process.env.ZALOPAY_KEY1,
    zaloPayKey2: process.env.ZALOPAY_KEY2,
    zaloPayPaymentUrl: process.env.ZALOPAY_PAYMENT_URL,
    zaloPayReturnUrl: process.env.ZALOPAY_RETURN_URL,
    zaloPayCallbackUrl: process.env.ZALOPAY_CALLBACK_URL,
};
