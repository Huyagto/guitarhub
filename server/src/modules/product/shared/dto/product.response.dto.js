'use strict';

const toManagerProductResponseDto = (product) => ({
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryId: String(product.categoryId),
    categorySlug: product.category?.slug || null,
    category: product.category?.name || null,
    brandId: String(product.brandId),
    brand: product.brand?.name || null,
    price: Number(product.price),
    stock: product.stock,
    image: product.image,
    shortDescription: product.shortDescription,
    description: product.description,
    status: product.status.toLowerCase(),
    rating: Number(product.rating),
    reviewCount: product.reviewCount,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
});

const toCustomerProductResponseDto = (product) => ({
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    category: product.category?.slug || null,
    categoryName: product.category?.name || null,
    brand: product.brand?.name || null,
    rating: Number(product.rating),
    reviewCount: product.reviewCount,
    images: product.image ? [product.image] : [],
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    specifications: {},
    stock: product.stock,
    tags: [],
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    createdAt: product.createdAt,
});

module.exports = {
    toManagerProductResponseDto,
    toCustomerProductResponseDto,
};
