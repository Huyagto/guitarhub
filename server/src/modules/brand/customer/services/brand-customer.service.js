'use strict';

const brandRepository = require('../../shared/repositories/brand.repository');
const { toBrandResponseDto } = require('../../shared/dto/brand.response.dto');

const getActiveBrands = async () => {
    const brands = await brandRepository.findMany({ status: 'ACTIVE' });
    return brands.map(toBrandResponseDto);
};

module.exports = { getActiveBrands };
