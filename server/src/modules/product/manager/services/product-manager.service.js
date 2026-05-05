'use strict';

const { ConflictRequestError, NotFoundError } = require('../../../../core');
const productRepository = require('../../shared/repositories/product.repository');
const categoryRepository = require('../../../category/shared/repositories/category.repository');
const brandRepository = require('../../../brand/shared/repositories/brand.repository');
const { toManagerProductResponseDto } = require('../../shared/dto/product.response.dto');

const ensureRelationsExist = async (categoryId, brandId) => {
    const [category, brand] = await Promise.all([
        categoryRepository.findById(categoryId),
        brandRepository.findById(brandId),
    ]);

    if (!category) {
        throw new NotFoundError('Không tìm thấy danh mục');
    }

    if (!brand) {
        throw new NotFoundError('Không tìm thấy thương hiệu');
    }
};

const getProducts = async (query) => {
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

const createProduct = async (payload) => {
    if (await productRepository.isSlugTaken(payload.slug)) {
        throw new ConflictRequestError('Slug sản phẩm đã tồn tại');
    }

    if (await productRepository.isSkuTaken(payload.sku)) {
        throw new ConflictRequestError('SKU sản phẩm đã tồn tại');
    }

    await ensureRelationsExist(payload.categoryId, payload.brandId);

    const product = await productRepository.create({
        name: payload.name,
        slug: payload.slug,
        sku: payload.sku,
        categoryId: payload.categoryId,
        brandId: payload.brandId,
        price: payload.price,
        stock: 0,
        image: payload.image || null,
        shortDescription: payload.shortDescription || null,
        description: payload.description || null,
        status: payload.status || 'DRAFT',
        isBestSeller: payload.isBestSeller || false,
        isNewArrival: payload.isNewArrival || false,
    }, payload.branchInventory);

    return toManagerProductResponseDto(product);
};

const updateProduct = async (id, payload) => {
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
        throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    if (payload.slug && await productRepository.isSlugTaken(payload.slug, id)) {
        throw new ConflictRequestError('Slug sản phẩm đã tồn tại');
    }

    if (payload.sku && await productRepository.isSkuTaken(payload.sku, id)) {
        throw new ConflictRequestError('SKU sản phẩm đã tồn tại');
    }

    if (payload.categoryId || payload.brandId) {
        await ensureRelationsExist(payload.categoryId || existingProduct.categoryId, payload.brandId || existingProduct.brandId);
    }

    const product = await productRepository.update(id, {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
        ...(payload.sku !== undefined ? { sku: payload.sku } : {}),
        ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
        ...(payload.brandId !== undefined ? { brandId: payload.brandId } : {}),
        ...(payload.price !== undefined ? { price: payload.price } : {}),
        ...(payload.image !== undefined ? { image: payload.image || null } : {}),
        ...(payload.shortDescription !== undefined ? { shortDescription: payload.shortDescription || null } : {}),
        ...(payload.description !== undefined ? { description: payload.description || null } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(payload.isBestSeller !== undefined ? { isBestSeller: payload.isBestSeller } : {}),
        ...(payload.isNewArrival !== undefined ? { isNewArrival: payload.isNewArrival } : {}),
    }, payload.branchInventory);

    return toManagerProductResponseDto(product);
};

const deleteProduct = async (id) => {
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
        throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    const product = await productRepository.remove(id);
    return toManagerProductResponseDto(product);
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
