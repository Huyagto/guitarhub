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

const getCheckoutTotals = (cartDto) => {
    const freeShippingThreshold = 5000000;
    const defaultShippingFee = 30000;
    const shippingFee = cartDto.subtotal >= freeShippingThreshold ? 0 : defaultShippingFee;

    return {
        subtotal: cartDto.subtotal,
        shippingFee,
        total: cartDto.subtotal + shippingFee,
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

    paymentSessionStore.updateSession(orderCode, {
        providerTransactionId: appTransId,
    });

    return payload.order_url;
};

const createCheckout = async (userId, payload, req) => {
    const [cartDto, customer] = await Promise.all([
        getCartSnapshot(userId),
        getCheckoutCustomer(userId),
    ]);
    const totals = getCheckoutTotals(cartDto);
    const orderCode = buildOrderCode();
    const initialOrderStatus = payload.paymentMethod === 'cod' ? 'pending_confirmation' : 'awaiting_payment';

    const order = await orderRepository.create({
        user: customer,
        orderNumber: orderCode,
        branchId: payload.branchId,
        shippingInfo: payload.shippingInfo,
        paymentMethod: payload.paymentMethod,
        paymentStatus: 'pending',
        status: initialOrderStatus,
        totals,
        items: cartDto.items,
        decrementStock: payload.paymentMethod === 'cod',
    });

    paymentSessionStore.saveSession({
        orderCode,
        userId,
        paymentMethod: payload.paymentMethod,
        branchId: payload.branchId,
        shippingInfo: payload.shippingInfo,
        items: cartDto.items,
        subtotal: totals.subtotal,
        shippingFee: totals.shippingFee,
        total: totals.total,
        status: payload.paymentMethod === 'cod' ? 'completed' : 'pending',
        createdAt: new Date().toISOString(),
    });

    if (payload.paymentMethod === 'cod') {
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
    const session = paymentSessionStore.getSession(query.vnp_TxnRef);

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

    paymentSessionStore.updateSession(session.orderCode, {
        status: isSuccess ? 'completed' : 'failed',
    });

    const updatedOrder = await orderRepository.updatePayment(session.orderCode, {
        paymentStatus: isSuccess ? 'paid' : 'failed',
        status: isSuccess ? 'pending_confirmation' : 'cancelled',
    });

    const orderDto = toOrderResponseDto(updatedOrder);
    if (isSuccess) {
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
    const session = paymentSessionStore.getSession(orderCode);

    if (!session) {
        return `${customerAppUrl}/checkout/success?status=failed&paymentMethod=momo`;
    }

    const isSuccess = String(payload.resultCode || payload.errorCode || '') === '0';
    paymentSessionStore.updateSession(orderCode, {
        status: isSuccess ? 'completed' : 'failed',
    });

    const updatedOrder = await orderRepository.updatePayment(orderCode, {
        paymentStatus: isSuccess ? 'paid' : 'failed',
        status: isSuccess ? 'pending_confirmation' : 'cancelled',
    });

    const orderDto = toOrderResponseDto(updatedOrder);
    if (isSuccess) {
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
    const session = paymentSessionStore.getSession(orderCode);

    if (session) {
        paymentSessionStore.updateSession(orderCode, { status: 'completed' });
        const updatedOrder = await orderRepository.updatePayment(orderCode, {
            paymentStatus: 'paid',
            status: 'pending_confirmation',
        });
        emitOrderCreated(toOrderResponseDto(updatedOrder));
        await clearUserCart(session.userId);
    }

    return { return_code: 1, return_message: 'success' };
};

module.exports = {
    createCheckout,
    handleVnpayCallback,
    handleMomoCallback,
    handleZalopayCallback,
};
