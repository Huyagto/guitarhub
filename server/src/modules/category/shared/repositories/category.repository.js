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
    return prisma.category.findMany({
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
    return prisma.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
};

const findBySlug = async (slug) => {
    return prisma.category.findUnique({
        where: { slug },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
};

const create = async (data) => {
    return prisma.category.create({
        data,
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
};

const update = async (id, data) => {
    return prisma.category.update({
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
    return prisma.category.delete({
        where: { id },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
};

const countProductsByCategoryId = async (categoryId) => {
    return prisma.product.count({ where: { categoryId } });
};

const isNameTaken = async (name, excludeId) => {
    const category = await prisma.category.findFirst({
        where: {
            name,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
    });

    return !!category;
};

const isSlugTaken = async (slug, excludeId) => {
    const category = await prisma.category.findFirst({
        where: {
            slug,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
    });

    return !!category;
};

module.exports = {
    findMany,
    findById,
    findBySlug,
    create,
    update,
    remove,
    countProductsByCategoryId,
    isNameTaken,
    isSlugTaken,
};
