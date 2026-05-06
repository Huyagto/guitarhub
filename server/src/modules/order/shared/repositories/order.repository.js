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
    statusHistory: {
        orderBy: { createdAt: 'asc' },
        include: {
            changedByUser: {
                select: { id: true, fullName: true, email: true, role: true },
            },
        },
    },
};

const toDbStatus = (status) => ORDER_STATUS_TO_DB[status] || status;
const toDbPaymentStatus = (status) => ORDER_PAYMENT_STATUS_TO_DB[status] || status;
const toDbPaymentMethod = (method) => ORDER_PAYMENT_METHOD_TO_DB[method] || method;

const createStatusHistory = (tx, { orderId, fromStatus, toStatus, changedByUserId, note }) => tx.orderStatusHistory.create({
    data: {
        orderId: Number(orderId),
        fromStatus: fromStatus || null,
        toStatus,
        changedByUserId: changedByUserId ? Number(changedByUserId) : null,
        note: note || null,
    },
});

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

const decrementBranchStock = async (tx, branchId, items, options = {}) => {
    if (!branchId) return;

    await assertBranchHasStock(tx, branchId, items);

    for (const item of items) {
        const productId = Number(item.productId);
        const current = await tx.branchInventory.findUnique({
            where: {
                branchId_productId: {
                    branchId: Number(branchId),
                    productId,
                },
            },
        });

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

        await tx.inventoryTransaction.create({
            data: {
                branchId: Number(branchId),
                productId,
                staffId: options.staffId ? Number(options.staffId) : null,
                type: 'SALE',
                quantity: item.quantity,
                stockBefore: current.stock,
                stockAfter: current.stock - item.quantity,
                note: options.note || 'Ban hang',
            },
        });
    }
};

const restoreBranchStock = async (tx, branchId, items, staffId) => {
    if (!branchId) return;

    for (const item of items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity || 0);
        if (!quantity) continue;

        const current = await tx.branchInventory.findUnique({
            where: {
                branchId_productId: {
                    branchId: Number(branchId),
                    productId,
                },
            },
        });

        if (!current) continue;

        await tx.branchInventory.update({
            where: {
                branchId_productId: {
                    branchId: Number(branchId),
                    productId,
                },
            },
            data: {
                stock: { increment: quantity },
                product: {
                    update: {
                        stock: { increment: quantity },
                    },
                },
            },
        });

        await tx.inventoryTransaction.create({
            data: {
                branchId: Number(branchId),
                productId,
                staffId: staffId ? Number(staffId) : null,
                type: 'STOCKTAKE',
                quantity,
                stockBefore: current.stock,
                stockAfter: current.stock + quantity,
                note: 'Hoan kho do huy don hang',
            },
        });
    }
};

const hasDeductedStock = (order) => {
    if (!order?.branchId) return false;
    if (order.paymentStatus === 'PAID') return true;
    return order.paymentMethod === 'COD';
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
        await decrementBranchStock(tx, branchId, items, { note: 'Ban hang online COD' });
    }

    await createStatusHistory(tx, {
        orderId: order.id,
        fromStatus: null,
        toStatus: order.status,
        changedByUserId: user.id,
        note: 'Tao don hang',
    });

    return order;
});

const createPos = async ({ staffId, branchId, customerName, customerPhone, note, paymentMethod, items, totals, shippingInfo }) => {
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
                shippingInfo: shippingInfo || { type: 'pos' },
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

        await decrementBranchStock(tx, branchId, items, { staffId, note: 'Ban hang POS' });

        await createStatusHistory(tx, {
            orderId: order.id,
            fromStatus: null,
            toStatus: order.status,
            changedByUserId: staffId,
            note: 'Tao don POS',
        });

        return order;
    });
};

const updatePos = async ({ orderId, staffId, branchId, customerName, customerPhone, note, paymentMethod, items, totals, shippingInfo }) => prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
        where: { id: Number(orderId) },
        include: { items: true },
    });

    if (!existing) return null;
    if (Number(existing.branchId) !== Number(branchId) || existing.customerId) {
        throw new Error('INVALID_POS_ORDER');
    }
    if (existing.status === 'CANCELLED') {
        throw new Error('ORDER_CANCELLED');
    }

    if (Array.isArray(items)) {
        await restoreBranchStock(tx, existing.branchId, existing.items, staffId);
        await assertBranchHasStock(tx, branchId, items);
        await tx.orderItem.deleteMany({ where: { orderId: existing.id } });
    }

    const order = await tx.order.update({
        where: { id: existing.id },
        data: {
            ...(customerName !== undefined ? { customerName: customerName || 'KhÃ¡ch vÃ£ng lai' } : {}),
            ...(customerPhone !== undefined ? { customerPhone: customerPhone || null } : {}),
            ...(note !== undefined ? { note: note || null } : {}),
            ...(paymentMethod ? { paymentMethod: toDbPaymentMethod(paymentMethod) } : {}),
            ...(totals ? {
                subtotal: totals.subtotal,
                shippingFee: totals.shippingFee || 0,
                total: totals.total,
            } : {}),
            ...(shippingInfo ? { shippingInfo } : {}),
            handledByStaffId: staffId ? Number(staffId) : existing.handledByStaffId,
            handledAt: new Date(),
            ...(Array.isArray(items) ? {
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
            } : {}),
        },
        include: ORDER_INCLUDE,
    });

    if (Array.isArray(items)) {
        await decrementBranchStock(tx, branchId, items, { staffId, note: 'Cap nhat don POS' });
    }

    await createStatusHistory(tx, {
        orderId: order.id,
        fromStatus: existing.status,
        toStatus: order.status,
        changedByUserId: staffId,
        note: 'Cap nhat don POS',
    });

    return order;
});

const cancelPos = async ({ orderId, staffId, branchId, note }) => prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
        where: { id: Number(orderId) },
        include: { items: true },
    });

    if (!existing) return null;
    if (Number(existing.branchId) !== Number(branchId) || existing.customerId) {
        throw new Error('INVALID_POS_ORDER');
    }
    if (existing.status === 'CANCELLED') {
        throw new Error('ORDER_CANCELLED');
    }

    await restoreBranchStock(tx, existing.branchId, existing.items, staffId);

    const order = await tx.order.update({
        where: { id: existing.id },
        data: {
            status: 'CANCELLED',
            paymentStatus: 'REFUNDED',
            handledByStaffId: staffId ? Number(staffId) : existing.handledByStaffId,
            handledAt: new Date(),
            note: note || existing.note,
        },
        include: ORDER_INCLUDE,
    });

    await createStatusHistory(tx, {
        orderId: order.id,
        fromStatus: existing.status,
        toStatus: 'CANCELLED',
        changedByUserId: staffId,
        note: note || 'Huy don POS',
    });

    return order;
});

const updateStatus = async (id, status, handledByStaffId, note, changedByUserId) => prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
        where: { id: Number(id) },
        include: {
            items: true,
        },
    });
    const nextStatus = toDbStatus(status);
    const autoPay = status === 'shipping' && existing?.paymentMethod === 'COD';
    const shouldRestoreStock = existing
        && existing.status !== 'CANCELLED'
        && nextStatus === 'CANCELLED'
        && hasDeductedStock(existing);
    const actorId = changedByUserId || handledByStaffId;

    const order = await tx.order.update({
        where: { id: Number(id) },
        data: {
            status: nextStatus,
            paymentStatus: autoPay ? 'PAID' : undefined,
            handledByStaffId: handledByStaffId ? Number(handledByStaffId) : undefined,
            handledAt: handledByStaffId ? new Date() : undefined,
        },
        include: ORDER_INCLUDE,
    });

    if (shouldRestoreStock) {
        await restoreBranchStock(tx, existing.branchId, existing.items, handledByStaffId);
    }

    if (existing?.status !== nextStatus) {
        await createStatusHistory(tx, {
            orderId: order.id,
            fromStatus: existing?.status || null,
            toStatus: nextStatus,
            changedByUserId: actorId,
            note,
        });
    }

    return order;
});

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
        await decrementBranchStock(tx, order.branchId, order.items, { note: 'Thanh toan don online' });
    }

    if (status && currentOrder?.status !== order.status) {
        await createStatusHistory(tx, {
            orderId: order.id,
            fromStatus: currentOrder?.status || null,
            toStatus: order.status,
            changedByUserId: order.customerId,
            note: 'Cap nhat ket qua thanh toan',
        });
    }

    return order;
});

module.exports = {
    findMany,
    findById,
    findByOrderNumber,
    create,
    createPos,
    updatePos,
    cancelPos,
    updateStatus,
    updatePayment,
};
