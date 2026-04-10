'use strict';

const toBrandResponseDto = (brand) => ({
    id: String(brand.id),
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logo: brand.logo,
    status: brand.status.toLowerCase(),
    productCount: brand._count?.products ?? 0,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
});

module.exports = { toBrandResponseDto };
