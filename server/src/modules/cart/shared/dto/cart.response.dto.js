'use strict';

const toCartItemResponseDto = (item) => ({
    id: String(item.id),
    productId: String(item.productId),
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.unitPrice) * item.quantity,
    product: item.product
        ? {
            id: String(item.product.id),
            name: item.product.name,
            slug: item.product.slug,
            sku: item.product.sku,
            image: item.product.image,
            price: Number(item.product.price),
            stock: item.product.stock,
            category: item.product.category
                ? {
                    id: String(item.product.category.id),
                    name: item.product.category.name,
                    slug: item.product.category.slug,
                }
                : null,
            brand: item.product.brand
                ? {
                    id: String(item.product.brand.id),
                    name: item.product.brand.name,
                    slug: item.product.brand.slug,
                }
                : null,
        }
        : null,
});

const toCartResponseDto = (cart) => {
    const items = (cart.items || []).map(toCartItemResponseDto);
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
        id: String(cart.id),
        userId: String(cart.userId),
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
    };
};

module.exports = {
    toCartItemResponseDto,
    toCartResponseDto,
};
