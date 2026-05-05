'use strict';

const { database: prisma } = require('../../../../config');
const { BadRequestError } = require('../../../../core');
const {
    ORDER_STATUS_TO_DB,
    ORDER_PAYMENT_STATUS_TO_DB,
    ORDER_PAYMENT_METHOD_TO_DB,
} = require('../constants');

const ORDER_INCLUDE = {
    branch: {
        select: {
            id: true,
            name: true,
            code: true,
        },
    },
    handledByStaff: {
        select: {
            id: true,
            fullName: true,
            email: true,
        },
    },
    items: {
        orderBy: { id: 'asc' },
    },
};

const toDbStatus = (status) => ORDER_STATUS_TO_DB[status] || status;
const toDbPaymentStatus = (status) => ORDER_PAYMENT_STATUS_TO_DB[status] || status;
const toDbPaymentMethod = (method) => ORDER_PAYMENT_METHOD_TO_DB[method] || method;

const findMany = async ({ customerId, branchId, onlineOnly = false, excludeStatuses = [] } = {}) => prisma.order.findMany({
    where: {
        ...(onlineOnly ? { customerId: { not: null } } : {}),
        ...(customerId ? { customerId: Number(customerId) } : {}),
        ...(branchId ? { branchId: Number(branchId) } : {}),
        ...(excludeStatuses.length
            ? {
                status: {
                    notIn: excludeStatuses.map(toDbStatus),
                },
            }
            : {}),
    },
    include: ORDER_INCLUDE,
    orderBy: {
        createdAt: 'desc',
    },
});

const findById = async (id) => prisma.order.findUnique({
    where: { id: Number(id) },
    include: ORDER_INCLUDE,
});

const findByOrderNumber = async (orderNumber) => prisma.order.findUnique({
    where: { orderNumber },
    include: ORDER_INCLUDE,
});

const generateOrderNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `ORD-${date}-${random}`;
};

const assertBranchHasStock = async (tx, branchId, items) => {
    if (!branchId) return;

    const branchInventory = await tx.branchInventory.findMany({
        where: {
            branchId: Number(branchId),
            productId: { in: items.map((item) => Number(item.productId)) },
        },
        include: {
            product: {
                select: { name: true },
            },
        },
    });

    const inventoryMap = new Map(branchInventory.map((item) => [item.productId, item]));

    for (const item of items) {
        const productId = Number(item.productId);
        const inventoryItem = inventoryMap.get(productId);
        const productName = item.productName || item.product?.name || inventoryItem?.product?.name || `ID ${productId}`;

        if (!inventoryItem || inventoryItem.stock < item.quantity) {
            throw new BadRequestError(`Chi nhanh da chon khong du ton kho cho san pham "${productName}"`);
        }
    }
};

const decrementBranchStock = async (tx, branchId, items) => {
    if (!branchId) return;

    await assertBranchHasStock(tx, branchId, items);

    for (const item of items) {
        const productId = Number(item.productId);
        await tx.branchInventory.update({
            where: {
                branchId_productId: {
                    branchId: Number(branchId),
                    productId,
                },
            },
            data: {
                stock: { decrement: item.quantity },
                product: {
                    update: {
                        stock: { decrement: item.quantity },
                    },
                },
            },
        });
    }
};

const create = async ({ user, orderNumber, branchId, shippingInfo, paymentMethod, paymentStatus, status, totals, items, decrementStock = false }) => prisma.$transaction(async (tx) => {
    if (branchId) {
        await assertBranchHasStock(tx, branchId, items);
    }

    const order = await tx.order.create({
        data: {
            orderNumber,
            customerId: user.id,
            customerName: shippingInfo.recipientName || user.fullName,
            customerEmail: user.email,
            customerPhone: shippingInfo.phone || null,
            branchId: branchId ? Number(branchId) : null,
            shippingInfo,
            paymentMethod: toDbPaymentMethod(paymentMethod),
            paymentStatus: toDbPaymentStatus(paymentStatus),
            status: toDbStatus(status),
            subtotal: totals.subtotal,
            shippingFee: totals.shippingFee,
            total: totals.total,
            note: shippingInfo.note || null,
            items: {
                create: items.map((item) => ({
                    productId: Number(item.productId),
                    productName: item.product?.name || 'San pham',
                    productSku: item.product?.sku || '',
                    image: item.product?.image || null,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
            },
        },
        include: ORDER_INCLUDE,
    });

    if (decrementStock) {
        await decrementBranchStock(tx, branchId, items);
    }

    return order;
});

const createPos = async ({ staffId, branchId, customerName, customerPhone, note, paymentMethod, items, totals }) => {
    const orderNumber = generateOrderNumber();
    return prisma.$transaction(async (tx) => {
        await assertBranchHasStock(tx, branchId, items);

        const order = await tx.order.create({
            data: {
                orderNumber,
                customerId: null,
                customerName: customerName || 'Khách vãng lai',
                customerEmail: null,
                customerPhone: customerPhone || null,
                shippingInfo: { type: 'pos' },
                paymentMethod: toDbPaymentMethod(paymentMethod),
                paymentStatus: 'PAID',
                status: 'DELIVERED',
                subtotal: totals.subtotal,
                shippingFee: 0,
                total: totals.total,
                note: note || null,
                branchId: branchId ? Number(branchId) : null,
                handledByStaffId: staffId ? Number(staffId) : null,
                handledAt: new Date(),
                items: {
                    create: items.map((item) => ({
                        productId: Number(item.productId),
                        productName: item.productName,
                        productSku: item.productSku || '',
                        image: item.image || null,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                    })),
                },
            },
            include: ORDER_INCLUDE,
        });

        await decrementBranchStock(tx, branchId, items);

        return order;
    });
};

const updateStatus = async (id, status, handledByStaffId) => {
    const existing = await prisma.order.findUnique({ where: { id: Number(id) }, select: { paymentMethod: true } });
    const autoPay = status === 'shipping' && existing?.paymentMethod === 'COD';

    return prisma.order.update({
        where: { id: Number(id) },
        data: {
            status: toDbStatus(status),
            paymentStatus: autoPay ? 'PAID' : undefined,
            handledByStaffId: handledByStaffId ? Number(handledByStaffId) : undefined,
            handledAt: handledByStaffId ? new Date() : undefined,
        },
        include: ORDER_INCLUDE,
    });
};

const updatePayment = async (orderNumber, { paymentStatus, status }) => prisma.$transaction(async (tx) => {
    const currentOrder = await tx.order.findUnique({
        where: { orderNumber },
        include: ORDER_INCLUDE,
    });

    const nextPaymentStatus = paymentStatus ? toDbPaymentStatus(paymentStatus) : undefined;
    const shouldDecrementStock = nextPaymentStatus === 'PAID' && currentOrder?.paymentStatus !== 'PAID';

    const order = await tx.order.update({
        where: { orderNumber },
        data: {
            paymentStatus: nextPaymentStatus,
            status: status ? toDbStatus(status) : undefined,
        },
        include: ORDER_INCLUDE,
    });

    if (shouldDecrementStock && order.branchId) {
        await decrementBranchStock(tx, order.branchId, order.items);
    }

    return order;
});

module.exports = {
    findMany,
    findById,
    findByOrderNumber,
    create,
    createPos,
    updateStatus,
    updatePayment,
};
