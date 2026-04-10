'use strict';

const { ConflictRequestError, NotFoundError, BadRequestError } = require('../../../../core');
const categoryRepository = require('../../shared/repositories/category.repository');
const { toCategoryResponseDto } = require('../../shared/dto/category.response.dto');

const getCategories = async (query = {}) => {
    const categories = await categoryRepository.findMany({
        search: query.search,
        status: query.status,
    });
    return categories.map(toCategoryResponseDto);
};

const getCategoryById = async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) {
        throw new NotFoundError('Không tìm thấy danh mục');
    }

    return toCategoryResponseDto(category);
};

const createCategory = async (payload) => {
    if (await categoryRepository.isNameTaken(payload.name)) {
        throw new ConflictRequestError('Tên danh mục đã tồn tại');
    }

    if (await categoryRepository.isSlugTaken(payload.slug)) {
        throw new ConflictRequestError('Slug danh mục đã tồn tại');
    }

    const category = await categoryRepository.create({
        name: payload.name,
        slug: payload.slug,
        description: payload.description || null,
        image: payload.image || null,
        status: payload.status || 'ACTIVE',
    });

    return toCategoryResponseDto(category);
};

const updateCategory = async (id, payload) => {
    const existingCategory = await categoryRepository.findById(id);
    if (!existingCategory) {
        throw new NotFoundError('Không tìm thấy danh mục');
    }

    if (payload.name && await categoryRepository.isNameTaken(payload.name, id)) {
        throw new ConflictRequestError('Tên danh mục đã tồn tại');
    }

    if (payload.slug && await categoryRepository.isSlugTaken(payload.slug, id)) {
        throw new ConflictRequestError('Slug danh mục đã tồn tại');
    }

    const category = await categoryRepository.update(id, {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
        ...(payload.description !== undefined ? { description: payload.description || null } : {}),
        ...(payload.image !== undefined ? { image: payload.image || null } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
    });

    return toCategoryResponseDto(category);
};

const deleteCategory = async (id) => {
    const existingCategory = await categoryRepository.findById(id);
    if (!existingCategory) {
        throw new NotFoundError('Không tìm thấy danh mục');
    }

    const productCount = await categoryRepository.countProductsByCategoryId(id);
    if (productCount > 0) {
        throw new BadRequestError('Không thể xóa danh mục đang có sản phẩm');
    }

    const category = await categoryRepository.remove(id);
    return toCategoryResponseDto(category);
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
