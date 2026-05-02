'use strict';

const { OK } = require('../../../../core');
const { validateRequest } = require('../../../../common');
const uploadManagerService = require('../services');

const uploadImage = async (req, res, next) => {
    try {
        validateRequest(req);
        const metadata = await uploadManagerService.uploadImage(req.body);
        return new OK({ message: 'Tai anh thanh cong', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    uploadImage,
};
