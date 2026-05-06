'use strict';

const {
    DB_ORDER_STATUS_TO_APP,
    DB_ORDER_PAYMENT_STATUS_TO_APP,
    DB_ORDER_PAYMENT_METHOD_TO_APP,
} = require('../constants');

const toNumber = (value) => Number(value || 0);

const isStoreOrder = (order) => {
    const shippingInfo = order.shippingInfo && typeof order.shippingInfo === 'object' ? order.shippingInfo : {};
    return shippingInfo.type === 'pos' || !order.customerId;
};

const toOrderResponseDto = (order) => ({
    id: String(order.id),
    customerId: order.customerId ? String(order.customerId) : null,
    orderNumber: order.orderNumber,
    customer: order.customerName,
    email: order.customerEmail || '',
    phone: order.customerPhone || '',
    items: order.items.reduce((total, item) => total + item.quantity, 0),
    total: toNumber(order.total),
    subtotal: toNumber(order.subtotal),
    shippingFee: toNumber(order.shippingFee),
    status: DB_ORDER_STATUS_TO_APP[order.status] || 'pending_confirmation',
    paymentStatus: DB_ORDER_PAYMENT_STATUS_TO_APP[order.paymentStatus] || 'pending',
    paymentMethod: DB_ORDER_PAYMENT_METHOD_TO_APP[order.paymentMethod] || 'cod',
    source: isStoreOrder(order) ? 'store' : 'online',
    branch: order.branch ? {
        id: String(order.branch.id),
        name: order.branch.name,
        code: order.branch.code,
    } : null,
    note: order.note || '',
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    shippingInfo: order.shippingInfo,
    handledByStaff: order.handledByStaff ? {
        id: String(order.handledByStaff.id),
        fullName: order.handledByStaff.fullName,
        email: order.handledByStaff.email,
    } : null,
    lineItems: order.items.map((item) => ({
        id: String(item.id),
        productId: String(item.productId),
        productName: item.productName,
        productSku: item.productSku,
        image: item.image || null,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
        lineTotal: toNumber(item.unitPrice) * item.quantity,
    })),
    statusHistory: (order.statusHistory || []).map((item) => ({
        id: String(item.id),
        fromStatus: item.fromStatus ? DB_ORDER_STATUS_TO_APP[item.fromStatus] || item.fromStatus.toLowerCase() : null,
        toStatus: DB_ORDER_STATUS_TO_APP[item.toStatus] || item.toStatus.toLowerCase(),
        note: item.note || '',
        createdAt: item.createdAt.toISOString(),
        changedBy: item.changedByUser ? {
            id: String(item.changedByUser.id),
            fullName: item.changedByUser.fullName,
            email: item.changedByUser.email,
            role: String(item.changedByUser.role || '').toLowerCase(),
        } : null,
    })),
});

module.exports = { toOrderResponseDto };
