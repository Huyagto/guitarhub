const bcrypt = require('bcryptjs');
const { bcryptSaltRounds } = require('../../config');

const hashPassword = async (password) => {
    return bcrypt.hash(password, bcryptSaltRounds);
};

const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
