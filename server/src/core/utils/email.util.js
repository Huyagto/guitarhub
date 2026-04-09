const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { emailUser, emailClientId, emailClientSecret, emailRedirectUri, emailRefreshToken } = require('../../config');

const createTransporter = async () => {
    const oAuth2Client = new google.auth.OAuth2(emailClientId, emailClientSecret, emailRedirectUri);
    oAuth2Client.setCredentials({ refresh_token: emailRefreshToken });

    const { token: accessToken } = await oAuth2Client.getAccessToken();

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: emailUser,
            clientId: emailClientId,
            clientSecret: emailClientSecret,
            refreshToken: emailRefreshToken,
            accessToken,
        },
    });
};

const sendOtpEmail = async (to, otp, expiresMinutes = 10) => {
    const transporter = await createTransporter();

    await transporter.sendMail({
        from: `GuitarHub <${emailUser}>`,
        to,
        subject: 'GuitarHub - Mã OTP đặt lại mật khẩu',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px;
                        border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #222; margin-bottom: 8px;">Đặt lại mật khẩu</h2>
                <p style="color: #555;">Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản GuitarHub.</p>
                <p style="color: #555;">Mã OTP của bạn là:</p>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #e65c00;
                            text-align: center; padding: 20px 0; background: #fff8f5;
                            border-radius: 6px; margin: 16px 0;">
                    ${otp}
                </div>
                <p style="color: #666;">Mã có hiệu lực trong <strong>${expiresMinutes} phút</strong>.
                    Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                <p style="font-size: 12px; color: #999;">
                    Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                    Tài khoản của bạn vẫn an toàn.
                </p>
            </div>
        `,
    });
};

module.exports = { sendOtpEmail };
