'use strict';

const { authRepository } = require('../../repositories');
const { hashPassword } = require('../../../../core/utils');
const { ConflictRequestError } = require('../../../../core');
const { omitPassword } = require('../../shared/utils');
const { roles } = require('../../constants');

const registerCustomer = async ({ email, password, fullName }) => {
    const emailTaken = await authRepository.isEmailTaken(email);
    if (emailTaken) throw new ConflictRequestError('Email đã được sử dụng');

    const hashedPassword = await hashPassword(password);
    const user = await authRepository.create({
        email,
        password: hashedPassword,
        fullName,
        role: roles.CUSTOMER,
    });

    return omitPassword(user);
};

module.exports = registerCustomer;
