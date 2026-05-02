'use strict';

const { BadRequestError, NotFoundError } = require('../../../../core');
const { database: prisma } = require('../../../../config');
const productRepository = require('../../shared/repositories/product.repository');
const { toManagerProductResponseDto } = require('../../shared/dto/product.response.dto');

const getStaffBranchId = async (staffId) => {
    const staff = await prisma.user.findUnique({
        where: { id: Number(staffId) },
        select: { branchId: true },
    });

    if (!staff?.branchId) {
        throw new BadRequestError('Nhân viên chưa được gán chi nhánh');
    }

    return staff.branchId;
};

const withBranchStock = async (branchId, products) => {
    const inventory = await prisma.branchInventory.findMany({
        where: {
            branchId,
            productId: { in: products.map((product) => product.id) },
        },
        select: { productId: true, stock: true },
    });
    const stockByProduct = new Map(inventory.map((item) => [item.productId, item.stock]));

    return products.map((product) => ({
        ...product,
        stock: stockByProduct.get(product.id) || 0,
    }));
};

const getProducts = async (staffId, query = {}) => {
    const branchId = await getStaffBranchId(staffId);
    const products = await productRepository.findMany({
        search: query.search,
        categorySlug: query.category,
        brandSlug: query.brand,
    });

    const productsWithBranchStock = await withBranchStock(branchId, products);
    return productsWithBranchStock.map(toManagerProductResponseDto);
};

const getProductById = async (staffId, id) => {
    const branchId = await getStaffBranchId(staffId);
    const product = await productRepository.findById(id);
    if (!product) {
        throw new NotFoundError('Không tìm thấy sản phẩm');
    }

    const [productWithBranchStock] = await withBranchStock(branchId, [product]);
    return toManagerProductResponseDto(productWithBranchStock);
};

module.exports = {
    getProducts,
    getProductById,
};
