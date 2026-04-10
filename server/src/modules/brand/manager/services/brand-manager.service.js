'use strict';

const { ConflictRequestError, NotFoundError, BadRequestError } = require('../../../../core');
const brandRepository = require('../../shared/repositories/brand.repository');
const { toBrandResponseDto } = require('../../shared/dto/brand.response.dto');

const getBrands = async (query = {}) => {
    const brands = await brandRepository.findMany({
        search: query.search,
        status: query.status,
    });
    return brands.map(toBrandResponseDto);
};

const getBrandById = async (id) => {
    const brand = await brandRepository.findById(id);
    if (!brand) {
        throw new NotFoundError('Không tìm thấy thương hiệu');
    }

    return toBrandResponseDto(brand);
};

const createBrand = async (payload) => {
    if (await brandRepository.isNameTaken(payload.name)) {
        throw new ConflictRequestError('Tên thương hiệu đã tồn tại');
    }

    if (await brandRepository.isSlugTaken(payload.slug)) {
        throw new ConflictRequestError('Slug thương hiệu đã tồn tại');
    }

    const brand = await brandRepository.create({
        name: payload.name,
        slug: payload.slug,
        description: payload.description || null,
        logo: payload.logo || null,
        status: payload.status || 'ACTIVE',
    });

    return toBrandResponseDto(brand);
};

const updateBrand = async (id, payload) => {
    const existingBrand = await brandRepository.findById(id);
    if (!existingBrand) {
        throw new NotFoundError('Không tìm thấy thương hiệu');
    }

    if (payload.name && await brandRepository.isNameTaken(payload.name, id)) {
        throw new ConflictRequestError('Tên thương hiệu đã tồn tại');
    }

    if (payload.slug && await brandRepository.isSlugTaken(payload.slug, id)) {
        throw new ConflictRequestError('Slug thương hiệu đã tồn tại');
    }

    const brand = await brandRepository.update(id, {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
        ...(payload.description !== undefined ? { description: payload.description || null } : {}),
        ...(payload.logo !== undefined ? { logo: payload.logo || null } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
    });

    return toBrandResponseDto(brand);
};

const deleteBrand = async (id) => {
    const existingBrand = await brandRepository.findById(id);
    if (!existingBrand) {
        throw new NotFoundError('Không tìm thấy thương hiệu');
    }

    const productCount = await brandRepository.countProductsByBrandId(id);
    if (productCount > 0) {
        throw new BadRequestError('Không thể xóa thương hiệu đang có sản phẩm');
    }

    const brand = await brandRepository.remove(id);
    return toBrandResponseDto(brand);
};

module.exports = {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
};
