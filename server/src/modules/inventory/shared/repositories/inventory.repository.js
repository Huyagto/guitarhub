'use strict';

const { database: prisma } = require('../../../../config');

const resolveInventoryStatus = (stock, minStock) => {
    if (stock <= 0) return 'out-of-stock';
    if (stock <= minStock) return 'low-stock';
    return 'in-stock';
};

const toInventoryItem = (inventoryItem) => ({
    id: String(inventoryItem.id),
    branchId: String(inventoryItem.branchId),
    branchName: inventoryItem.branch?.name || '',
    productId: String(inventoryItem.productId),
    productName: inventoryItem.product?.name || '',
    sku: inventoryItem.product?.sku || '',
    currentStock: inventoryItem.stock,
    minStock: inventoryItem.minStock,
    maxStock: inventoryItem.maxStock,
    status: resolveInventoryStatus(inventoryItem.stock, inventoryItem.minStock),
    lastRestocked: inventoryItem.lastRestockedAt.toISOString(),
});

const findMany = async ({ branchId } = {}) => {
    const inventory = await prisma.branchInventory.findMany({
        where: {
            ...(branchId ? { branchId: Number(branchId) } : {}),
        },
        include: {
            branch: { select: { id: true, name: true, code: true } },
            product: { select: { id: true, name: true, sku: true } },
        },
        orderBy: [
            { stock: 'asc' },
            { updatedAt: 'desc' },
        ],
    });

    return inventory.map(toInventoryItem);
};

const restock = async (id, quantity) => {
    const inventoryItem = await prisma.branchInventory.update({
        where: { id: Number(id) },
        data: {
            stock: {
                increment: quantity,
            },
            product: {
                update: {
                    stock: {
                        increment: quantity,
                    },
                    lastRestockedAt: new Date(),
                },
            },
            lastRestockedAt: new Date(),
        },
        include: {
            branch: { select: { id: true, name: true, code: true } },
            product: { select: { id: true, name: true, sku: true } },
        },
    });

    return toInventoryItem(inventoryItem);
};

module.exports = {
    findMany,
    restock,
};
