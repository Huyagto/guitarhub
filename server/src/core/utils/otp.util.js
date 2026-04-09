const OTP_EXPIRES_MINUTES = 10;

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOtpExpiresAt = () => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRES_MINUTES);
    return expiresAt;
};

module.exports = { generateOtp, getOtpExpiresAt, OTP_EXPIRES_MINUTES };
