'use strict';

const { NotFoundError } = require('../../../../core');
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

module.exports = {
    getCategories,
    getCategoryById,
};
