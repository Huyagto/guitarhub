'use strict';

const categoryRepository = require('../../shared/repositories/category.repository');
const { toCategoryResponseDto } = require('../../shared/dto/category.response.dto');

const getActiveCategories = async () => {
    const categories = await categoryRepository.findMany({ status: 'ACTIVE' });
    return categories.map(toCategoryResponseDto);
};

module.exports = { getActiveCategories };
