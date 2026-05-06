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

const toInventoryTransaction = (transaction) => ({
    id: String(transaction.id),
    branchId: String(transaction.branchId),
    branchName: transaction.branch?.name || '',
    productId: String(transaction.productId),
    productName: transaction.product?.name || '',
    sku: transaction.product?.sku || '',
    staffId: transaction.staffId ? String(transaction.staffId) : null,
    staffName: transaction.staff?.fullName || '',
    type: String(transaction.type || '').toLowerCase(),
    quantity: transaction.quantity,
    stockBefore: transaction.stockBefore,
    stockAfter: transaction.stockAfter,
    counterparty: transaction.counterparty || '',
    note: transaction.note || '',
    createdAt: transaction.createdAt.toISOString(),
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

const adjustStock = async (id, { type, quantity, stockDelta, staffId, counterparty, note }) => prisma.$transaction(async (tx) => {
    const current = await tx.branchInventory.findUnique({
        where: { id: Number(id) },
        include: {
            branch: { select: { id: true, name: true, code: true } },
            product: { select: { id: true, name: true, sku: true } },
        },
    });

    if (!current) return null;

    const normalizedType = String(type || 'RECEIVE').toUpperCase();
    const signedQuantity = Number.isFinite(stockDelta)
        ? stockDelta
        : (['ISSUE', 'TRANSFER_OUT'].includes(normalizedType) ? -Math.abs(quantity) : Math.abs(quantity));
    const nextStock = current.stock + signedQuantity;
    if (nextStock < 0) {
        throw new Error('INSUFFICIENT_STOCK');
    }

    const inventoryItem = await tx.branchInventory.update({
        where: { id: Number(id) },
        data: {
            stock: nextStock,
            product: {
                update: {
                    stock: { increment: signedQuantity },
                    ...(signedQuantity > 0 ? { lastRestockedAt: new Date() } : {}),
                },
            },
            ...(signedQuantity > 0 ? { lastRestockedAt: new Date() } : {}),
        },
        include: {
            branch: { select: { id: true, name: true, code: true } },
            product: { select: { id: true, name: true, sku: true } },
        },
    });

    await tx.inventoryTransaction.create({
        data: {
            branchId: current.branchId,
            productId: current.productId,
            staffId: staffId ? Number(staffId) : null,
            type: normalizedType,
            quantity: Math.abs(quantity),
            stockBefore: current.stock,
            stockAfter: nextStock,
            counterparty: counterparty || null,
            note: note || null,
        },
    });

    return toInventoryItem(inventoryItem);
});

const restock = async (id, quantity, options = {}) => adjustStock(id, {
    ...options,
    type: 'RECEIVE',
    quantity,
});

const findTransactions = async ({ branchId, productId, type } = {}) => {
    const transactions = await prisma.inventoryTransaction.findMany({
        where: {
            ...(branchId ? { branchId: Number(branchId) } : {}),
            ...(productId ? { productId: Number(productId) } : {}),
            ...(type ? { type: String(type).toUpperCase() } : {}),
        },
        include: {
            branch: { select: { id: true, name: true, code: true } },
            product: { select: { id: true, name: true, sku: true } },
            staff: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    return transactions.map(toInventoryTransaction);
};

module.exports = {
    findMany,
    restock,
    adjustStock,
    findTransactions,
};
