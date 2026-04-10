'use strict';

const crypto = require('crypto');
const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = require('../../../../config');
const { BadRequestError } = require('../../../../core');

const uploadProductImage = async ({ file, folder = 'guitarhub/products' }) => {
    if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
        throw new BadRequestError('Cloudinary chua duoc cau hinh');
    }

    if (!file || typeof file !== 'string' || !file.startsWith('data:image/')) {
        throw new BadRequestError('Du lieu anh khong hop le');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
        .createHash('sha1')
        .update(`folder=${folder}&timestamp=${timestamp}${cloudinaryApiSecret}`)
        .digest('hex');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', cloudinaryApiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', folder);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new BadRequestError(payload?.error?.message || 'Upload anh len Cloudinary that bai');
    }

    return {
        url: payload.secure_url,
        publicId: payload.public_id,
        width: payload.width,
        height: payload.height,
        format: payload.format,
    };
};

module.exports = {
    uploadProductImage,
};
