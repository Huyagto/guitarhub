'use strict';

const { database: prisma } = require('../../../../config');

const productInclude = {
    category: true,
    brand: true,
    branchInventory: {
        include: {
            branch: true,
        },
        orderBy: { branchId: 'asc' },
    },
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

const normalizeBranchStocks = (branchInventory = []) => {
    const stockByBranch = new Map();
    branchInventory.forEach((item) => {
        const branchId = Number(item.branchId);
        if (Number.isInteger(branchId) && branchId > 0) {
            stockByBranch.set(branchId, Math.max(0, Number(item.stock || 0)));
        }
    });
    return stockByBranch;
};

const create = async (data, branchInventory = []) => {
    return prisma.$transaction(async (tx) => {
        const stockByBranch = normalizeBranchStocks(branchInventory);
        const initialStock = Array.from(stockByBranch.values()).reduce((sum, stock) => sum + stock, 0);
        const product = await tx.product.create({
            data: {
                ...data,
                stock: initialStock,
            },
            include: productInclude,
        });

        const branches = await tx.branch.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'asc' },
            select: { id: true },
        });

        if (branches.length) {
            await tx.branchInventory.createMany({
                data: branches.map((branch) => ({
                    branchId: branch.id,
                    productId: product.id,
                    stock: stockByBranch.get(branch.id) || 0,
                    minStock: data.minStock || 5,
                    maxStock: data.maxStock || 20,
                })),
                skipDuplicates: true,
            });
        }

        return tx.product.findUnique({
            where: { id: product.id },
            include: productInclude,
        });
    });
};

const update = async (id, data, branchInventory) => {
    return prisma.$transaction(async (tx) => {
        await tx.product.update({
            where: { id },
            data,
        });

        if (Array.isArray(branchInventory)) {
            const stockByBranch = normalizeBranchStocks(branchInventory);

            await Promise.all(Array.from(stockByBranch.entries()).map(([branchId, stock]) =>
                tx.branchInventory.upsert({
                    where: {
                        branchId_productId: {
                            branchId,
                            productId: id,
                        },
                    },
                    create: {
                        branchId,
                        productId: id,
                        stock,
                    },
                    update: {
                        stock,
                    },
                })
            ));

            const aggregate = await tx.branchInventory.aggregate({
                where: { productId: id },
                _sum: { stock: true },
            });

            await tx.product.update({
                where: { id },
                data: {
                    stock: aggregate._sum.stock || 0,
                    lastRestockedAt: new Date(),
                },
            });
        }

        return tx.product.findUnique({
            where: { id },
            include: productInclude,
        });
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
