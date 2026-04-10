'use strict';

const { database: prisma } = require('../../../../config');

const cartInclude = {
    items: {
        orderBy: { createdAt: 'desc' },
        include: {
            product: {
                include: {
                    category: true,
                    brand: true,
                },
            },
        },
    },
};

const findByUserId = async (userId) => {
    return prisma.cart.findUnique({
        where: { userId },
        include: cartInclude,
    });
};

const createForUser = async (userId) => {
    return prisma.cart.create({
        data: { userId },
        include: cartInclude,
    });
};

const findOrCreateByUserId = async (userId) => {
    const existingCart = await findByUserId(userId);
    if (existingCart) return existingCart;
    return createForUser(userId);
};

const findItemById = async (id) => {
    return prisma.cartItem.findUnique({
        where: { id },
        include: {
            cart: true,
            product: {
                include: {
                    category: true,
                    brand: true,
                },
            },
        },
    });
};

const findItemByCartAndProduct = async (cartId, productId) => {
    return prisma.cartItem.findUnique({
        where: {
            cartId_productId: {
                cartId,
                productId,
            },
        },
        include: {
            product: {
                include: {
                    category: true,
                    brand: true,
                },
            },
        },
    });
};

const addItem = async ({ cartId, productId, quantity, unitPrice }) => {
    return prisma.cartItem.create({
        data: {
            cartId,
            productId,
            quantity,
            unitPrice,
        },
    });
};

const updateItem = async (id, data) => {
    return prisma.cartItem.update({
        where: { id },
        data,
    });
};

const removeItem = async (id) => {
    return prisma.cartItem.delete({
        where: { id },
    });
};

const clearCart = async (cartId) => {
    await prisma.cartItem.deleteMany({
        where: { cartId },
    });
};

module.exports = {
    findByUserId,
    createForUser,
    findOrCreateByUserId,
    findItemById,
    findItemByCartAndProduct,
    addItem,
    updateItem,
    removeItem,
    clearCart,
};
