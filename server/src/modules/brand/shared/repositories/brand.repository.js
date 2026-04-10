'use strict';

const { database: prisma } = require('../../../../config');

const buildWhere = ({ search, status } = {}) => ({
    ...(status ? { status } : {}),
    ...(search
        ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {}),
});

const findMany = async (filters = {}) => {
    return prisma.brand.findMany({
        where: buildWhere(filters),
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
};

const findById = async (id) => {
    return prisma.brand.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
};

const create = async (data) => {
    return prisma.brand.create({
        data,
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
};

const update = async (id, data) => {
    return prisma.brand.update({
        where: { id },
        data,
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
};

const remove = async (id) => {
    return prisma.brand.delete({
        where: { id },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
};

const countProductsByBrandId = async (brandId) => {
    return prisma.product.count({ where: { brandId } });
};

const isNameTaken = async (name, excludeId) => {
    const brand = await prisma.brand.findFirst({
        where: {
            name,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
    });

    return !!brand;
};

const isSlugTaken = async (slug, excludeId) => {
    const brand = await prisma.brand.findFirst({
        where: {
            slug,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
    });

    return !!brand;
};

module.exports = {
    findMany,
    findById,
    create,
    update,
    remove,
    countProductsByBrandId,
    isNameTaken,
    isSlugTaken,
};
