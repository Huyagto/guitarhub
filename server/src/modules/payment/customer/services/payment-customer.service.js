'use strict';

const crypto = require('crypto');
const querystring = require('querystring');
const {
    customerAppUrl,
    momoAccessKey,
    momoIpnUrl,
    momoPartnerCode,
    momoPaymentUrl,
    momoReturnUrl,
    momoSecretKey,
    vnpayHashSecret,
    vnpayPaymentUrl,
    vnpayReturnUrl,
    vnpayTmnCode,
    zaloPayAppId,
    zaloPayCallbackUrl,
    zaloPayKey1,
    zaloPayKey2,
    zaloPayPaymentUrl,
    zaloPayReturnUrl,
    database: prisma,
} = require('../../../../config');
const { BadRequestError } = require('../../../../core');
const cartRepository = require('../../../cart/shared/repositories/cart.repository');
const { toCartResponseDto } = require('../../../cart/shared/dto/cart.response.dto');
const paymentSessionStore = require('../../shared/services/payment-session.store');
const orderRepository = require('../../../order/shared/repositories/order.repository');
const { toOrderResponseDto } = require('../../../order/shared/dto/order.response.dto');
const { emitOrderCreated, emitOrderUpdated } = require('../../../../realtime/socket.server');

const buildOrderCode = () => `GH${Date.now()}`;
const toNumber = (value) => Number(value || 0);

const sortObject = (input) => Object.keys(input)
    .sort()
    .reduce((result, key) => {
        result[key] = input[key];
        return result;
    }, {});

const encodeVnpayValue = (value) => encodeURIComponent(String(value)).replace(/%20/g, '+');

const buildVnpayParams = (input) => Object.keys(input)
    .sort()
    .reduce((result, key) => {
        const value = input[key];

        if (value === undefined || value === null || value === '') {
            return result;
        }

        result[key] = encodeVnpayValue(value);
        return result;
    }, {});

const createVnpaySecureHash = (params) => {
    const signData = querystring.stringify(params, { encode: false });
    return crypto.createHmac('sha512', vnpayHashSecret).update(signData, 'utf8').digest('hex');
};

const getClientIp = (req) => req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || '127.0.0.1';

const getCartSnapshot = async (userId) => {
    const cart = await cartRepository.findOrCreateByUserId(userId);
    const cartDto = toCartResponseDto(cart);

    if (!cartDto.items.length) {
        throw new BadRequestError('Gio hang dang trong');
    }

    return cartDto;
};

const getCheckoutCustomer = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
            id: true,
            email: true,
            fullName: true,
        },
    });

    if (!user) {
        throw new BadRequestError('Khong tim thay khach hang');
    }

    return user;
};

const calculateDistanceKm = ({ fromLat, fromLon, toLat, toLon }) => {
    const coordinates = [fromLat, fromLon, toLat, toLon].map(Number);
    if (coordinates.some((value) => !Number.isFinite(value))) {
        throw new BadRequestError('Khong du thong tin toa do de tinh phi giao hang');
    }

    const [lat1, lon1, lat2, lon2] = coordinates;
    const toRadians = (value) => value * Math.PI / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calculateShippingFee = (subtotalAfterDiscount, distanceKm) => {
    const freeShippingThreshold = 5000000;
    if (subtotalAfterDiscount >= freeShippingThreshold) return 0;

    const baseFee = 18000;
    const perKmFee = 5000;
    return baseFee + Math.ceil(Math.max(distanceKm, 1)) * perKmFee;
};

const getCheckoutBranch = async (branchId) => {
    const branch = await prisma.branch.findFirst({
        where: {
            id: Number(branchId),
            status: 'ACTIVE',
        },
        select: {
            id: true,
            name: true,
            code: true,
            latitude: true,
            longitude: true,
        },
    });

    if (!branch) {
        throw new BadRequestError('Chi nhanh da chon khong hop le');
    }

    return branch;
};

const getCheckoutVoucher = async (code, subtotal) => {
    const normalizedCode = String(code || '').trim().toUpperCase();
    if (!normalizedCode) {
        return null;
    }

    const voucher = await prisma.voucher.findFirst({
        where: {
            code: normalizedCode,
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

    const minPurchase = toNumber(voucher.minPurchase);
    if (subtotal < minPurchase) {
        throw new BadRequestError(`Don hang toi thieu ${minPurchase.toLocaleString('vi-VN')}d de dung ma nay`);
    }

    const value = toNumber(voucher.value);
    const discountAmount = String(voucher.type).toUpperCase() === 'PERCENTAGE'
        ? Math.floor(subtotal * value / 100)
        : Math.min(value, subtotal);

    return {
        id: voucher.id,
        code: voucher.code,
        discountAmount,
    };
};

const markVoucherUsed = async (voucherId) => {
    if (!voucherId) return;

    await prisma.voucher.update({
        where: { id: Number(voucherId) },
        data: { usedCount: { increment: 1 } },
    });
};

const getCheckoutTotals = ({ cartDto, branch, shippingInfo, voucher }) => {
    const distanceKm = calculateDistanceKm({
        fromLat: shippingInfo.lat,
        fromLon: shippingInfo.lon,
        toLat: branch.latitude,
        toLon: branch.longitude,
    });
    const discountAmount = voucher?.discountAmount || 0;
    const subtotalAfterDiscount = Math.max(0, cartDto.subtotal - discountAmount);
    const shippingFee = calculateShippingFee(subtotalAfterDiscount, distanceKm);

    return {
        subtotal: cartDto.subtotal,
        discountAmount,
        shippingFee,
        distanceKm,
        total: subtotalAfterDiscount + shippingFee,
    };
};

const buildSuccessUrl = ({ orderCode, paymentMethod, status = 'success' }) => {
    const params = new URLSearchParams({
        orderCode,
        paymentMethod,
        status,
    });

    return `${customerAppUrl}/checkout/success?${params.toString()}`;
};

const clearUserCart = async (userId) => {
    const cart = await cartRepository.findOrCreateByUserId(userId);
    await cartRepository.clearCart(cart.id);
};

const createVnpayUrl = ({ amount, orderCode, req }) => {
    if (!vnpayTmnCode || !vnpayHashSecret || !vnpayPaymentUrl || !vnpayReturnUrl) {
        throw new BadRequestError('VNPAY chua duoc cau hinh');
    }

    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const vnpCreateDate = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const rawParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnpayTmnCode,
        vnp_Amount: String(amount * 100),
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderCode,
        vnp_OrderInfo: `Thanh toan don hang ${orderCode}`,
        vnp_OrderType: 'other',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: vnpayReturnUrl,
        vnp_IpAddr: getClientIp(req),
        vnp_CreateDate: vnpCreateDate,
    };

    const signedParams = buildVnpayParams(rawParams);
    const secureHash = createVnpaySecureHash(signedParams);

    return `${vnpayPaymentUrl}?${querystring.stringify({
        ...signedParams,
        vnp_SecureHash: secureHash,
    }, { encode: false })}`;
};

const createMomoUrl = async ({ amount, orderCode }) => {
    if (!momoAccessKey || !momoIpnUrl || !momoPartnerCode || !momoPaymentUrl || !momoReturnUrl || !momoSecretKey) {
        throw new BadRequestError('MoMo chua duoc cau hinh');
    }

    const requestId = orderCode;
    const orderInfo = `Thanh toan don hang ${orderCode}`;
    const requestType = 'captureWallet';
    const extraData = '';

    const rawSignature = [
        `accessKey=${momoAccessKey}`,
        `amount=${amount}`,
        `extraData=${extraData}`,
        `ipnUrl=${momoIpnUrl}`,
        `orderId=${orderCode}`,
        `orderInfo=${orderInfo}`,
        `partnerCode=${momoPartnerCode}`,
        `redirectUrl=${momoReturnUrl}`,
        `requestId=${requestId}`,
        `requestType=${requestType}`,
    ].join('&');

    const signature = crypto.createHmac('sha256', momoSecretKey).update(rawSignature).digest('hex');

    const response = await fetch(momoPaymentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            partnerCode: momoPartnerCode,
            accessKey: momoAccessKey,
            requestId,
            amount: String(amount),
            orderId: orderCode,
            orderInfo,
            redirectUrl: momoReturnUrl,
            ipnUrl: momoIpnUrl,
            requestType,
            extraData,
            autoCapture: true,
            lang: 'vi',
            signature,
        }),
    });

    const payload = await response.json();

    if (!response.ok || !payload.payUrl) {
        throw new BadRequestError(payload.message || 'Khoi tao thanh toan MoMo that bai');
    }

    return payload.payUrl;
};

const createZalopayUrl = async ({ amount, orderCode, userId, items }) => {
    if (!zaloPayAppId || !zaloPayKey1 || !zaloPayPaymentUrl) {
        throw new BadRequestError('ZaloPay chua duoc cau hinh');
    }

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const appTransId = `${yy}${mm}${dd}_${orderCode}`;
    const appTime = Date.now();
    const embedData = JSON.stringify({
        redirecturl: zaloPayReturnUrl || buildSuccessUrl({ orderCode, paymentMethod: 'zalopay' }),
    });
    const item = JSON.stringify(items.map((cartItem) => ({
        itemid: cartItem.productId,
        itemname: cartItem.product?.name || 'San pham',
        itemprice: cartItem.unitPrice,
        itemquantity: cartItem.quantity,
    })));

    const rawMac = [
        zaloPayAppId,
        appTransId,
        `user_${userId}`,
        amount,
        appTime,
        embedData,
        item,
    ].join('|');

    const mac = crypto.createHmac('sha256', zaloPayKey1).update(rawMac).digest('hex');

    const response = await fetch(zaloPayPaymentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            app_id: zaloPayAppId,
            app_user: `user_${userId}`,
            app_time: String(appTime),
            amount: String(amount),
            app_trans_id: appTransId,
            embed_data: embedData,
            item,
            description: `GuitarHub - Thanh toan don hang ${orderCode}`,
            bank_code: '',
            callback_url: zaloPayCallbackUrl || '',
            mac,
        }).toString(),
    });

    const payload = await response.json();

    if (!response.ok || Number(payload.return_code) !== 1 || !payload.order_url) {
        throw new BadRequestError(payload.return_message || 'Khoi tao thanh toan ZaloPay that bai');
    }

    await paymentSessionStore.updateSession(orderCode, {
        providerTransactionId: appTransId,
    });

    return payload.order_url;
};

const createCheckout = async (userId, payload, req) => {
    const [cartDto, customer] = await Promise.all([
        getCartSnapshot(userId),
        getCheckoutCustomer(userId),
    ]);
    const [branch, voucher] = await Promise.all([
        getCheckoutBranch(payload.branchId),
        getCheckoutVoucher(payload.voucherCode, cartDto.subtotal),
    ]);
    const totals = getCheckoutTotals({
        cartDto,
        branch,
        shippingInfo: payload.shippingInfo,
        voucher,
    });
    const orderCode = buildOrderCode();
    const initialOrderStatus = payload.paymentMethod === 'cod' ? 'pending_confirmation' : 'awaiting_payment';
    const shippingInfo = {
        ...payload.shippingInfo,
        branchDistanceKm: Number(totals.distanceKm.toFixed(2)),
        shippingFee: totals.shippingFee,
        voucherCode: voucher?.code || null,
        discountAmount: totals.discountAmount,
    };

    const order = await orderRepository.create({
        user: customer,
        orderNumber: orderCode,
        branchId: payload.branchId,
        shippingInfo,
        paymentMethod: payload.paymentMethod,
        paymentStatus: 'pending',
        status: initialOrderStatus,
        totals,
        items: cartDto.items,
        decrementStock: payload.paymentMethod === 'cod',
    });

    await paymentSessionStore.saveSession({
        orderCode,
        userId,
        paymentMethod: payload.paymentMethod,
        branchId: payload.branchId,
        shippingInfo,
        items: cartDto.items,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        shippingFee: totals.shippingFee,
        total: totals.total,
        voucherId: voucher?.id || null,
        status: payload.paymentMethod === 'cod' ? 'completed' : 'pending',
        createdAt: new Date().toISOString(),
    });

    if (payload.paymentMethod === 'cod') {
        await markVoucherUsed(voucher?.id);
        emitOrderCreated(toOrderResponseDto(order));
        await clearUserCart(userId);
        return {
            orderCode,
            paymentMethod: 'cod',
            redirectUrl: buildSuccessUrl({ orderCode, paymentMethod: 'cod' }),
        };
    }

    let paymentUrl = '';

    if (payload.paymentMethod === 'vnpay') {
        paymentUrl = createVnpayUrl({ amount: totals.total, orderCode, req });
    } else if (payload.paymentMethod === 'momo') {
        paymentUrl = await createMomoUrl({ amount: totals.total, orderCode });
    } else if (payload.paymentMethod === 'zalopay') {
        paymentUrl = await createZalopayUrl({
            amount: totals.total,
            orderCode,
            userId,
            items: cartDto.items,
        });
    }

    return {
        orderCode,
        paymentMethod: payload.paymentMethod,
        paymentUrl,
    };
};

const handleVnpayCallback = async (query) => {
    const secureHash = query.vnp_SecureHash;
    const session = await paymentSessionStore.getSession(query.vnp_TxnRef);

    if (!session) {
        return `${customerAppUrl}/checkout/success?status=failed&paymentMethod=vnpay`;
    }

    const params = { ...query };
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const signedParams = buildVnpayParams(sortObject(params));
    const expectedHash = createVnpaySecureHash(signedParams);
    const isSuccess =
        String(secureHash || '').toLowerCase() === String(expectedHash).toLowerCase()
        && query.vnp_ResponseCode === '00';

    await paymentSessionStore.updateSession(session.orderCode, {
        status: isSuccess ? 'completed' : 'failed',
    });

    const updatedOrder = await orderRepository.updatePayment(session.orderCode, {
        paymentStatus: isSuccess ? 'paid' : 'failed',
        status: isSuccess ? 'pending_confirmation' : 'cancelled',
    });

    const orderDto = toOrderResponseDto(updatedOrder);
    if (isSuccess) {
        await markVoucherUsed(session.voucherId);
        emitOrderCreated(orderDto);
        await clearUserCart(session.userId);
    } else {
        emitOrderUpdated(orderDto);
    }

    return buildSuccessUrl({
        orderCode: session.orderCode,
        paymentMethod: 'vnpay',
        status: isSuccess ? 'success' : 'failed',
    });
};

const handleMomoCallback = async (payload) => {
    const orderCode = payload.orderId || payload.requestId;
    const session = await paymentSessionStore.getSession(orderCode);

    if (!session) {
        return `${customerAppUrl}/checkout/success?status=failed&paymentMethod=momo`;
    }

    const isSuccess = String(payload.resultCode || payload.errorCode || '') === '0';
    await paymentSessionStore.updateSession(orderCode, {
        status: isSuccess ? 'completed' : 'failed',
    });

    const updatedOrder = await orderRepository.updatePayment(orderCode, {
        paymentStatus: isSuccess ? 'paid' : 'failed',
        status: isSuccess ? 'pending_confirmation' : 'cancelled',
    });

    const orderDto = toOrderResponseDto(updatedOrder);
    if (isSuccess) {
        await markVoucherUsed(session.voucherId);
        emitOrderCreated(orderDto);
        await clearUserCart(session.userId);
    } else {
        emitOrderUpdated(orderDto);
    }

    return buildSuccessUrl({
        orderCode,
        paymentMethod: 'momo',
        status: isSuccess ? 'success' : 'failed',
    });
};

const handleZalopayCallback = async (payload) => {
    const expectedMac = crypto.createHmac('sha256', zaloPayKey2).update(payload.data).digest('hex');

    if (expectedMac !== payload.mac) {
        return { return_code: -1, return_message: 'invalid mac' };
    }

    const callbackData = JSON.parse(payload.data);
    const orderCode = callbackData.app_trans_id?.split('_')[1];
    const session = await paymentSessionStore.getSession(orderCode);

    if (session) {
        await paymentSessionStore.updateSession(orderCode, { status: 'completed' });
        const updatedOrder = await orderRepository.updatePayment(orderCode, {
            paymentStatus: 'paid',
            status: 'pending_confirmation',
        });
        await markVoucherUsed(session.voucherId);
        emitOrderCreated(toOrderResponseDto(updatedOrder));
        await clearUserCart(session.userId);
    }

    return { return_code: 1, return_message: 'success' };
};

const previewCheckout = async (userId, { branchId, voucherCode, shippingInfo }) => {
    const cartDto = await getCartSnapshot(userId);
    const branch = await getCheckoutBranch(branchId);
    const voucher = voucherCode ? await getCheckoutVoucher(voucherCode, cartDto.subtotal) : null;
    const totals = getCheckoutTotals({ cartDto, branch, shippingInfo, voucher });

    return {
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        shippingFee: totals.shippingFee,
        distanceKm: Number(totals.distanceKm.toFixed(1)),
        total: totals.total,
        voucher: voucher ? { code: voucher.code, discountAmount: voucher.discountAmount } : null,
    };
};

module.exports = {
    createCheckout,
    previewCheckout,
    handleVnpayCallback,
    handleMomoCallback,
    handleZalopayCallback,
};
