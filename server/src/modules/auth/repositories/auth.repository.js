const { database: prisma } = require('../../../config');

const findByEmail = async (email) => {
    return prisma.user.findUnique({ where: { email } });
};

const findById = async (id) => {
    return prisma.user.findUnique({ where: { id } });
};

const findByGoogleId = async (googleId) => {
    return prisma.user.findUnique({ where: { googleId } });
};

const create = async (data) => {
    return prisma.user.create({ data });
};

const updatePassword = async (email, hashedPassword) => {
    return prisma.user.update({ where: { email }, data: { password: hashedPassword } });
};

const updateGoogleId = async (id, googleId) => {
    return prisma.user.update({ where: { id }, data: { googleId } });
};

const isEmailTaken = async (email) => {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    return !!user;
};

module.exports = { findByEmail, findById, findByGoogleId, create, updatePassword, updateGoogleId, isEmailTaken };
