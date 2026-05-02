'use strict';

const { database: prisma } = require('../../../../config');

const productInclude = {
    category: true,
    brand: true,
};

const buildWhere = ({ search, categorySlug, brandSlug, status }) => ({
    ...(status ? { status } : {}),
    ...(search
        ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {}),
    ...(categorySlug
        ? {
            category: {
                slug: categorySlug,
            },
        }
        : {}),
    ...(brandSlug
        ? {
            brand: {
                slug: brandSlug,
            },
        }
        : {}),
});

const findMany = async (filters = {}) => {
    return prisma.product.findMany({
        where: buildWhere(filters),
        include: productInclude,
        orderBy: { createdAt: 'desc' },
    });
};

const findById = async (id) => {
    return prisma.product.findUnique({
        where: { id },
        include: productInclude,
    });
};

const findBySlug = async (slug) => {
    return prisma.product.findUnique({
        where: { slug },
        include: productInclude,
    });
};

const create = async (data) => {
    return prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
            data,
            include: productInclude,
        });

        const branches = await tx.branch.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'asc' },
            select: { id: true },
        });

        if (branches.length) {
            await tx.branchInventory.createMany({
                data: branches.map((branch, index) => ({
                    branchId: branch.id,
                    productId: product.id,
                    stock: index === 0 ? Number(data.stock || 0) : 0,
                    minStock: data.minStock || 5,
                    maxStock: data.maxStock || 20,
                })),
                skipDuplicates: true,
            });
        }

        return product;
    });
};

const update = async (id, data) => {
    return prisma.product.update({
        where: { id },
        data,
        include: productInclude,
    });
};

const remove = async (id) => {
    return prisma.product.delete({
        where: { id },
        include: productInclude,
    });
};

const findRelatedProducts = async ({ productId, categoryId, limit = 4 }) => {
    return prisma.product.findMany({
        where: {
            id: { not: productId },
            categoryId,
            status: 'ACTIVE',
        },
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
};

const isSlugTaken = async (slug, excludeId) => {
    const product = await prisma.product.findFirst({
        where: {
            slug,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
    });

    return !!product;
};

const isSkuTaken = async (sku, excludeId) => {
    const product = await prisma.product.findFirst({
        where: {
            sku,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
    });

    return !!product;
};

module.exports = {
    findMany,
    findById,
    findBySlug,
    create,
    update,
    remove,
    findRelatedProducts,
    isSlugTaken,
    isSkuTaken,
};
