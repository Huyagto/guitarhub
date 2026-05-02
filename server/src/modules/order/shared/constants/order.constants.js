'use strict';

const ORDER_STATUSES = [
    'awaiting_payment',
    'pending_confirmation',
    'confirmed',
    'preparing',
    'ready_to_ship',
    'shipping',
    'delivered',
    'cancelled',
];

const ORDER_PAYMENT_STATUSES = [
    'pending',
    'paid',
    'failed',
    'refunded',
];

const ORDER_PAYMENT_METHODS = [
    'cod',
    'vnpay',
    'momo',
    'zalopay',
    'cash',
    'bank_transfer',
];

const ORDER_STATUS_TRANSITIONS = {
    awaiting_payment: ['pending_confirmation', 'cancelled'],
    pending_confirmation: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready_to_ship', 'cancelled'],
    ready_to_ship: ['shipping', 'cancelled'],
    shipping: ['delivered'],
    delivered: [],
    cancelled: [],
};

const ORDER_STATUS_TO_DB = {
    awaiting_payment: 'AWAITING_PAYMENT',
    pending_confirmation: 'PENDING_CONFIRMATION',
    confirmed: 'CONFIRMED',
    preparing: 'PREPARING',
    ready_to_ship: 'READY_TO_SHIP',
    shipping: 'SHIPPING',
    delivered: 'DELIVERED',
    cancelled: 'CANCELLED',
};

const ORDER_PAYMENT_STATUS_TO_DB = {
    pending: 'PENDING',
    paid: 'PAID',
    failed: 'FAILED',
    refunded: 'REFUNDED',
};

const ORDER_PAYMENT_METHOD_TO_DB = {
    cod: 'COD',
    vnpay: 'VNPAY',
    momo: 'MOMO',
    zalopay: 'ZALOPAY',
    cash: 'CASH',
    bank_transfer: 'BANK_TRANSFER',
};

const DB_ORDER_STATUS_TO_APP = Object.fromEntries(
    Object.entries(ORDER_STATUS_TO_DB).map(([appStatus, dbStatus]) => [dbStatus, appStatus]),
);

const DB_ORDER_PAYMENT_STATUS_TO_APP = Object.fromEntries(
    Object.entries(ORDER_PAYMENT_STATUS_TO_DB).map(([appStatus, dbStatus]) => [dbStatus, appStatus]),
);

const DB_ORDER_PAYMENT_METHOD_TO_APP = Object.fromEntries(
    Object.entries(ORDER_PAYMENT_METHOD_TO_DB).map(([appStatus, dbStatus]) => [dbStatus, appStatus]),
);

module.exports = {
    ORDER_STATUSES,
    ORDER_PAYMENT_STATUSES,
    ORDER_PAYMENT_METHODS,
    ORDER_STATUS_TRANSITIONS,
    ORDER_STATUS_TO_DB,
    ORDER_PAYMENT_STATUS_TO_DB,
    ORDER_PAYMENT_METHOD_TO_DB,
    DB_ORDER_STATUS_TO_APP,
    DB_ORDER_PAYMENT_STATUS_TO_APP,
    DB_ORDER_PAYMENT_METHOD_TO_APP,
};
