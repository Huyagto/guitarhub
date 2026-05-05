'use strict';

const { NotFoundError } = require('../../../../core');
const { database: prisma } = require('../../../../config');
const productRepository = require('../../shared/repositories/product.repository');
const {
    toCustomerProductResponseDto,
} = require('../../shared/dto/product.response.dto');

const toNumberOrNull = (value) => (value === null || value === undefined ? null : Number(value));

const calculateDistanceKm = ({ fromLat, fromLon, toLat, toLon }) => {
    const coordinates = [fromLat, fromLon, toLat, toLon].map(Number);
    if (coordinates.some((value) => !Number.isFinite(value))) return null;

    const [lat1, lon1, lat2, lon2] = coordinates;
    const toRadians = (value) => value * Math.PI / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

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

const getAvailableBranches = async (productIds = [], location = {}) => {
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
            latitude: toNumberOrNull(branch.latitude),
            longitude: toNumberOrNull(branch.longitude),
            distanceKm: calculateDistanceKm({
                fromLat: location.lat,
                fromLon: location.lon,
                toLat: branch.latitude,
                toLon: branch.longitude,
            }),
            inventory: branch.inventory.map((item) => ({
                productId: String(item.productId),
                productName: item.product.name,
                sku: item.product.sku,
                stock: item.stock,
            })),
        }))
        .filter((branch) => ids.every((id) => branch.inventory.some((item) => Number(item.productId) === id && item.stock > 0)))
        .sort((a, b) => {
            if (a.distanceKm === null && b.distanceKm === null) return a.name.localeCompare(b.name);
            if (a.distanceKm === null) return 1;
            if (b.distanceKm === null) return -1;
            return a.distanceKm - b.distanceKm;
        });
};

module.exports = {
    getProducts,
    getBestSellerProducts,
    getNewArrivalProducts,
    getProductBySlug,
    getRelatedProducts,
    getAvailableBranches,
};
