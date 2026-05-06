'use strict';

const { BadRequestError, NotFoundError } = require('../../../../core');
const { database: prisma } = require('../../../../config');
const orderManagerService = require('../../manager/services/order-manager.service');
const orderRepository = require('../../shared/repositories/order.repository');
const { toOrderResponseDto } = require('../../shared/dto/order.response.dto');
const { emitOrderCreated } = require('../../../../realtime/socket.server');
const { ORDER_PAYMENT_METHODS } = require('../../shared/constants');

const getStaffBranchId = async (staffId) => {
    const staff = await prisma.user.findUnique({
        where: { id: Number(staffId) },
        select: { branchId: true },
    });

    if (!staff?.branchId) {
        throw new BadRequestError('Nhan vien chua duoc gan chi nhanh');
    }

    return staff.branchId;
};

const getOrders = async (staffId) => {
    const branchId = await getStaffBranchId(staffId);
    const orders = await orderRepository.findMany({
        branchId,
        onlineOnly: true,
        excludeStatuses: ['awaiting_payment'],
    });

    return orders.map(toOrderResponseDto);
};

const getOrderHistory = async (staffId) => {
    const branchId = await getStaffBranchId(staffId);
    const orders = await orderRepository.findMany({
        branchId,
        excludeStatuses: ['awaiting_payment'],
    });

    return orders.map(toOrderResponseDto);
};

const getPosVoucher = async (code, subtotal) => {
    if (!code) return null;

    const voucher = await prisma.voucher.findFirst({
        where: {
            code: String(code).toUpperCase().trim(),
            status: 'ACTIVE',
            expiresAt: { gt: new Date() },
        },
    });

    if (!voucher) {
        throw new BadRequestError('Ma giam gia khong hop le hoac da het han');
    }

    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
        throw new BadRequestError('Ma giam gia da het luot su dung');
    }

    const minPurchase = Number(voucher.minPurchase || 0);
    if (subtotal < minPurchase) {
        throw new BadRequestError(`Don hang toi thieu ${minPurchase.toLocaleString('vi-VN')}d de dung ma nay`);
    }

    const value = Number(voucher.value || 0);
    const discountAmount = String(voucher.type).toUpperCase() === 'PERCENTAGE'
        ? Math.floor(subtotal * value / 100)
        : Math.min(value, subtotal);

    return {
        id: voucher.id,
        code: voucher.code,
        discountAmount,
    };
};

const buildPosItems = async (items) => {
    if (!items || !items.length) {
        throw new BadRequestError('Don hang phai co it nhat mot san pham');
    }

    const productIds = items.map((item) => Number(item.productId));
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true, image: true, price: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return items.map((item) => {
        const product = productMap.get(Number(item.productId));
        if (!product) throw new NotFoundError(`Khong tim thay san pham ID ${item.productId}`);

        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new BadRequestError('So luong san pham khong hop le');
        }

        return {
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            image: product.image,
            quantity,
            unitPrice: Number(product.price),
        };
    });
};

const buildPosTotals = async ({ items, voucherCode }) => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const voucher = await getPosVoucher(voucherCode, subtotal);
    const discountAmount = voucher?.discountAmount || 0;

    return {
        subtotal,
        voucher,
        discountAmount,
        total: subtotal - discountAmount,
    };
};

const updateOrderStatus = async (id, status, staffId) => {
    const branchId = await getStaffBranchId(staffId);
    const order = await orderRepository.findById(id);

    if (!order) {
        throw new NotFoundError('Khong tim thay don hang');
    }

    if (Number(order.branchId) !== Number(branchId)) {
        throw new BadRequestError('Nhan vien khong the xu ly don cua chi nhanh khac');
    }

    if (!order.customerId) {
        throw new BadRequestError('Dung endpoint POS de cap nhat hoac huy don tai quay');
    }

    return orderManagerService.updateOrderStatus(id, status, staffId);
};

const createPosOrder = async (staffId, { customerName, customerPhone, note, paymentMethod, voucherCode, items }) => {
    const paymentMethodKey = String(paymentMethod || '').toLowerCase().replace('-', '_');
    if (!ORDER_PAYMENT_METHODS.includes(paymentMethodKey)) {
        throw new BadRequestError('Phuong thuc thanh toan khong hop le');
    }

    const branchId = await getStaffBranchId(staffId);
    const enrichedItems = await buildPosItems(items);
    const { subtotal, voucher, discountAmount, total } = await buildPosTotals({ items: enrichedItems, voucherCode });

    const order = await orderRepository.createPos({
        staffId,
        branchId,
        customerName,
        customerPhone,
        note,
        paymentMethod: paymentMethodKey,
        items: enrichedItems,
        totals: { subtotal, shippingFee: 0, total },
        shippingInfo: {
            type: 'pos',
            voucherCode: voucher?.code || null,
            discountAmount,
        },
    });

    if (voucher?.id) {
        await prisma.voucher.update({
            where: { id: Number(voucher.id) },
            data: { usedCount: { increment: 1 } },
        });
    }

    const dto = toOrderResponseDto(order);
    emitOrderCreated(dto);
    return dto;
};

const updatePosOrder = async (staffId, orderId, { customerName, customerPhone, note, paymentMethod, voucherCode, items }) => {
    const branchId = await getStaffBranchId(staffId);
    const paymentMethodKey = paymentMethod
        ? String(paymentMethod).toLowerCase().replace('-', '_')
        : undefined;

    if (paymentMethodKey && !ORDER_PAYMENT_METHODS.includes(paymentMethodKey)) {
        throw new BadRequestError('Phuong thuc thanh toan khong hop le');
    }

    const enrichedItems = Array.isArray(items) ? await buildPosItems(items) : undefined;
    const totals = enrichedItems
        ? await buildPosTotals({ items: enrichedItems, voucherCode })
        : null;
    const existingOrder = totals?.voucher ? await orderRepository.findById(orderId) : null;
    const previousVoucherCode = existingOrder?.shippingInfo && typeof existingOrder.shippingInfo === 'object'
        ? existingOrder.shippingInfo.voucherCode
        : null;

    try {
        const order = await orderRepository.updatePos({
            orderId,
            staffId,
            branchId,
            customerName,
            customerPhone,
            note,
            paymentMethod: paymentMethodKey,
            items: enrichedItems,
            totals: totals ? { subtotal: totals.subtotal, shippingFee: 0, total: totals.total } : undefined,
            shippingInfo: totals ? {
                type: 'pos',
                voucherCode: totals.voucher?.code || null,
                discountAmount: totals.discountAmount,
            } : undefined,
        });

        if (!order) throw new NotFoundError('Khong tim thay don POS');
        if (totals?.voucher?.id && previousVoucherCode !== totals.voucher.code) {
            await prisma.voucher.update({
                where: { id: Number(totals.voucher.id) },
                data: { usedCount: { increment: 1 } },
            });
        }
        return toOrderResponseDto(order);
    } catch (error) {
        if (error.message === 'INVALID_POS_ORDER') throw new BadRequestError('Nhan vien chi cap nhat don POS cua chi nhanh minh');
        if (error.message === 'ORDER_CANCELLED') throw new BadRequestError('Don POS da huy khong the cap nhat');
        throw error;
    }
};

const cancelPosOrder = async (staffId, orderId, { note } = {}) => {
    const branchId = await getStaffBranchId(staffId);

    try {
        const order = await orderRepository.cancelPos({
            orderId,
            staffId,
            branchId,
            note: note ? String(note).trim() : undefined,
        });

        if (!order) throw new NotFoundError('Khong tim thay don POS');
        return toOrderResponseDto(order);
    } catch (error) {
        if (error.message === 'INVALID_POS_ORDER') throw new BadRequestError('Nhan vien chi huy don POS cua chi nhanh minh');
        if (error.message === 'ORDER_CANCELLED') throw new BadRequestError('Don POS da duoc huy');
        throw error;
    }
};

module.exports = {
    getOrders,
    getOrderHistory,
    updateOrderStatus,
    createPosOrder,
    updatePosOrder,
    cancelPosOrder,
};
