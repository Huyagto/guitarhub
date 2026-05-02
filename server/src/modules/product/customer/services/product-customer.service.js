'use strict';

const { NotFoundError } = require('../../../../core');
const { database: prisma } = require('../../../../config');
const productRepository = require('../../shared/repositories/product.repository');
const {
    toCustomerProductResponseDto,
} = require('../../shared/dto/product.response.dto');

const getProducts = async (query) => {
    const products = await productRepository.findMany({
        search: query.search,
        categorySlug: query.category,
        brandSlug: query.brand,
        status: 'ACTIVE',
    });

    return products.map(toCustomerProductResponseDto);
};

const getBestSellerProducts = async () => {
    const products = await productRepository.findMany({ status: 'ACTIVE' });
    return products
        .filter((product) => product.isBestSeller)
        .map(toCustomerProductResponseDto);
};

const getNewArrivalProducts = async () => {
    const products = await productRepository.findMany({ status: 'ACTIVE' });
    return products
        .filter((product) => product.isNewArrival)
        .map(toCustomerProductResponseDto);
};

const getProductBySlug = async (slug) => {
    const product = await productRepository.findBySlug(slug);
    if (!product || product.status !== 'ACTIVE') {
        throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    return toCustomerProductResponseDto(product);
};

const getRelatedProducts = async (slug) => {
    const product = await productRepository.findBySlug(slug);
    if (!product || product.status !== 'ACTIVE') {
        throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    const relatedProducts = await productRepository.findRelatedProducts({
        productId: product.id,
        categoryId: product.categoryId,
    });

    return relatedProducts.map(toCustomerProductResponseDto);
};

const getAvailableBranches = async (productIds = []) => {
    const ids = String(productIds || '')
        .split(',')
        .map((id) => Number(id))
        .filter(Boolean);

    if (!ids.length) return [];

    const branches = await prisma.branch.findMany({
        where: {
            status: 'ACTIVE',
            inventory: {
                every: {},
            },
        },
        include: {
            inventory: {
                where: { productId: { in: ids } },
                include: {
                    product: { select: { id: true, name: true, sku: true } },
                },
            },
        },
        orderBy: { name: 'asc' },
    });

    return branches
        .map((branch) => ({
            id: String(branch.id),
            name: branch.name,
            code: branch.code,
            address: branch.address || '',
            phone: branch.phone || '',
            inventory: branch.inventory.map((item) => ({
                productId: String(item.productId),
                productName: item.product.name,
                sku: item.product.sku,
                stock: item.stock,
            })),
        }))
        .filter((branch) => ids.every((id) => branch.inventory.some((item) => Number(item.productId) === id && item.stock > 0)));
};

module.exports = {
    getProducts,
    getBestSellerProducts,
    getNewArrivalProducts,
    getProductBySlug,
    getRelatedProducts,
    getAvailableBranches,
};
