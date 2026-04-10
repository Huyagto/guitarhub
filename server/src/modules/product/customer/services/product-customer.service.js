'use strict';

const { NotFoundError } = require('../../../../core');
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

module.exports = {
    getProducts,
    getBestSellerProducts,
    getNewArrivalProducts,
    getProductBySlug,
    getRelatedProducts,
};
