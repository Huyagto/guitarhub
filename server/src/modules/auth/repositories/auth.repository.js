const { database: prisma } = require('../../../config');

const findByEmail = async (email) => {
    return prisma.user.findUnique({ where: { email } });
};

const findById = async (id) => {
    return prisma.user.findUnique({
        where: { id },
        include: {
            branch: {
                select: { id: true, name: true, code: true, address: true },
            },
        },
    });
};

const findByStaffCode = async (staffCode) => {
    return prisma.user.findUnique({
        where: { staffCode },
        include: {
            branch: {
                select: { id: true, name: true, code: true, address: true },
            },
        },
    });
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

const updateDefaultShippingAddress = async (id, defaultShippingAddress) => {
    return prisma.user.update({
        where: { id },
        data: { defaultShippingAddress },
    });
};

const updateProfile = async (id, data) => {
    return prisma.user.update({ where: { id }, data });
};

const isEmailTaken = async (email) => {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    return !!user;
};

module.exports = {
    findByEmail,
    findById,
    findByStaffCode,
    findByGoogleId,
    create,
    updatePassword,
    updateGoogleId,
    updateDefaultShippingAddress,
    updateProfile,
    isEmailTaken,
};
