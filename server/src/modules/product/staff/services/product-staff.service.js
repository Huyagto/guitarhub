'use strict';

const { NotFoundError } = require('../../../../core');
const productRepository = require('../../shared/repositories/product.repository');
const { toManagerProductResponseDto } = require('../../shared/dto/product.response.dto');

const getProducts = async (query = {}) => {
    const products = await productRepository.findMany({
        search: query.search,
        categorySlug: query.category,
        brandSlug: query.brand,
    });

    return products.map(toManagerProductResponseDto);
};

const getProductById = async (id) => {
    const product = await productRepository.findById(id);
    if (!product) {
        throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    return toManagerProductResponseDto(product);
};

module.exports = {
    getProducts,
    getProductById,
};
