'use strict';

const { BadRequestError, NotFoundError } = require('../../../../core');
const { database: prisma } = require('../../../../config');
const orderManagerService = require('../../manager/services/order-manager.service');
const orderRepository = require('../../shared/repositories/order.repository');
const { toOrderResponseDto } = require('../../shared/dto/order.response.dto');
const { emitOrderCreated } = require('../../../../realtime/socket.server');
const { ORDER_PAYMENT_METHODS } = require('../../shared/constants');

const getOrders = async () => {
    const orders = await orderRepository.findMany({
        excludeStatuses: ['awaiting_payment'],
    });

    return orders.map(toOrderResponseDto);
};

const updateOrderStatus = async (id, status, staffId) => orderManagerService.updateOrderStatus(id, status, staffId);

const createPosOrder = async (staffId, { customerName, customerPhone, note, paymentMethod, items, totals }) => {
    if (!items || !items.length) {
        throw new BadRequestError('Đơn hàng phải có ít nhất một sản phẩm');
    }

    const paymentMethodKey = String(paymentMethod || '').toLowerCase().replace('-', '_');
    if (!ORDER_PAYMENT_METHODS.includes(paymentMethodKey)) {
        throw new BadRequestError('Phương thức thanh toán không hợp lệ');
    }

    const staff = await prisma.user.findUnique({
        where: { id: Number(staffId) },
        select: { branchId: true },
    });

    if (!staff?.branchId) {
        throw new BadRequestError('Nhan vien chua duoc gan chi nhanh');
    }

    const productIds = items.map((item) => Number(item.productId));
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true, image: true, stock: true, price: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const enrichedItems = items.map((item) => {
        const product = productMap.get(Number(item.productId));
        if (!product) throw new NotFoundError(`Không tìm thấy sản phẩm ID ${item.productId}`);
        if (product.stock < item.quantity) throw new BadRequestError(`Sản phẩm "${product.name}" không đủ tồn kho`);

        return {
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            image: product.image,
            quantity: item.quantity,
            unitPrice: Number(product.price),
        };
    });

    const subtotal = enrichedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const discountAmount = totals?.discountAmount || 0;
    const total = subtotal - discountAmount;

    const order = await orderRepository.createPos({
        staffId,
        branchId: staff.branchId,
        customerName,
        customerPhone,
        note,
        paymentMethod: paymentMethodKey,
        items: enrichedItems,
        totals: { subtotal, shippingFee: 0, total },
    });

    const dto = toOrderResponseDto(order);
    emitOrderCreated(dto);
    return dto;
};

module.exports = {
    getOrders,
    updateOrderStatus,
    createPosOrder,
};
