'use strict';

const { BadRequestError, ForbiddenError, NotFoundError } = require('../../../../core');
const cartRepository = require('../../shared/repositories/cart.repository');
const productRepository = require('../../../product/shared/repositories/product.repository');
const { toCartResponseDto } = require('../../shared/dto/cart.response.dto');

const getCart = async (userId) => {
    const cart = await cartRepository.findOrCreateByUserId(userId);
    return toCartResponseDto(cart);
};

const addItemToCart = async (userId, { productId, quantity }) => {
    const [cart, product] = await Promise.all([
        cartRepository.findOrCreateByUserId(userId),
        productRepository.findById(productId),
    ]);

    if (!product || product.status !== 'ACTIVE') {
        throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    if (product.stock < quantity) {
        throw new BadRequestError('Số lượng vượt quá tồn kho hiện tại');
    }

    const existingItem = await cartRepository.findItemByCartAndProduct(cart.id, productId);

    if (existingItem) {
        const nextQuantity = existingItem.quantity + quantity;
        if (product.stock < nextQuantity) {
            throw new BadRequestError('Số lượng vượt quá tồn kho hiện tại');
        }

        await cartRepository.updateItem(existingItem.id, {
            quantity: nextQuantity,
            unitPrice: product.price,
        });
    } else {
        await cartRepository.addItem({
            cartId: cart.id,
            productId,
            quantity,
            unitPrice: product.price,
        });
    }

    const nextCart = await cartRepository.findOrCreateByUserId(userId);
    return toCartResponseDto(nextCart);
};

const updateCartItemQuantity = async (userId, itemId, quantity) => {
    const item = await cartRepository.findItemById(itemId);
    if (!item) {
        throw new NotFoundError('Không tìm thấy item trong giỏ hàng');
    }

    if (item.cart.userId !== userId) {
        throw new ForbiddenError('Bạn không có quyền thao tác giỏ hàng này');
    }

    if (item.product.stock < quantity) {
        throw new BadRequestError('Số lượng vượt quá tồn kho hiện tại');
    }

    await cartRepository.updateItem(itemId, {
        quantity,
        unitPrice: item.product.price,
    });

    const cart = await cartRepository.findOrCreateByUserId(userId);
    return toCartResponseDto(cart);
};

const removeCartItem = async (userId, itemId) => {
    const item = await cartRepository.findItemById(itemId);
    if (!item) {
        throw new NotFoundError('Không tìm thấy item trong giỏ hàng');
    }

    if (item.cart.userId !== userId) {
        throw new ForbiddenError('Bạn không có quyền thao tác giỏ hàng này');
    }

    await cartRepository.removeItem(itemId);
    const cart = await cartRepository.findOrCreateByUserId(userId);
    return toCartResponseDto(cart);
};

const clearCustomerCart = async (userId) => {
    const cart = await cartRepository.findOrCreateByUserId(userId);
    await cartRepository.clearCart(cart.id);
    const nextCart = await cartRepository.findOrCreateByUserId(userId);
    return toCartResponseDto(nextCart);
};

module.exports = {
    getCart,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCustomerCart,
};
