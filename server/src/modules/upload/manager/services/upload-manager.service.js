'use strict';

const { uploadProductImage } = require('../../../product/shared/services/product-image.service');

const uploadImage = async (payload) => uploadProductImage(payload);

module.exports = {
    uploadImage,
};
