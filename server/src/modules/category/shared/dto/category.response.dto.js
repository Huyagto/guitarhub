'use strict';

const toCategoryResponseDto = (category) => ({
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    status: category.status.toLowerCase(),
    productCount: category._count?.products ?? 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
});

module.exports = { toCategoryResponseDto };
