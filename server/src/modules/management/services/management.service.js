'use strict';

const { BadRequestError, NotFoundError } = require('../../../core');
const { database: prisma } = require('../../../config');
const { roles } = require('../../auth/constants');
const { hashPassword } = require('../../../core/utils');
const reportRepository = require('../../report/shared/repositories/report.repository');

const toNumber = (value) => Number(value || 0);

const getStaffWithBranch = async (staffId) => {
    const staff = await prisma.user.findUnique({
        where: { id: Number(staffId) },
        include: {
            branch: {
                select: { id: true, name: true, code: true },
            },
        },
    });

    if (!staff?.branchId || !staff.branch) {
        throw new BadRequestError('Nhan vien chua duoc gan chi nhanh');
    }

    return staff;
};

const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
};

const toVoucherResponse = (voucher) => ({
    id: String(voucher.id),
    code: voucher.code,
    type: String(voucher.type || '').toLowerCase(),
    value: toNumber(voucher.value),
    minPurchase: toNumber(voucher.minPurchase),
    usageLimit: voucher.usageLimit,
    usedCount: voucher.usedCount,
    status: String(voucher.status || '').toLowerCase(),
    expiresAt: voucher.expiresAt.toISOString().split('T')[0],
});

const resolveVoucherStatus = (status, expiresAt) => {
    if (String(status || '').toLowerCase() === 'disabled') {
        return 'DISABLED';
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
        return 'EXPIRED';
    }

    return 'ACTIVE';
};

const getCustomers = async () => {
    const users = await prisma.user.findMany({
        where: { role: roles.CUSTOMER },
        orderBy: { createdAt: 'desc' },
        include: {
            orders: {
                select: {
                    total: true,
                },
            },
        },
    });

    return users.map((user) => {
        const shippingAddress =
            user.defaultShippingAddress && typeof user.defaultShippingAddress === 'object'
                ? user.defaultShippingAddress
                : null;

        return {
            id: String(user.id),
            name: user.fullName,
            email: user.email,
            phone: shippingAddress?.phone || '',
            totalOrders: user.orders.length,
            totalSpent: user.orders.reduce((sum, order) => sum + toNumber(order.total), 0),
            status: user.isActive ? 'active' : 'inactive',
            joinedAt: user.createdAt,
        };
    });
};

const getDashboardOverview = async () => reportRepository.getDashboardOverview();

const getVouchers = async () => {
    const vouchers = await prisma.voucher.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return vouchers.map(toVoucherResponse);
};

const createVoucher = async (payload) => {
    if (!payload?.code) {
        throw new BadRequestError('Ma giam gia la bat buoc');
    }

    const expiresAt = new Date(payload.expiresAt);
    const voucher = await prisma.voucher.create({
        data: {
            code: String(payload.code).toUpperCase().trim(),
            type: String(payload.type || 'percentage').toUpperCase(),
            value: payload.value,
            minPurchase: payload.minPurchase || 0,
            usageLimit: payload.usageLimit || 0,
            usedCount: payload.usedCount || 0,
            status: resolveVoucherStatus(payload.status, expiresAt),
            expiresAt,
        },
    });

    return toVoucherResponse(voucher);
};

const updateVoucher = async (id, payload) => {
    const voucherId = Number(id);
    const existingVoucher = await prisma.voucher.findUnique({
        where: { id: voucherId },
    });

    if (!existingVoucher) {
        throw new NotFoundError('Khong tim thay ma giam gia');
    }

    const expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : existingVoucher.expiresAt;
    const voucher = await prisma.voucher.update({
        where: { id: voucherId },
        data: {
            ...(payload.code ? { code: String(payload.code).toUpperCase().trim() } : {}),
            ...(payload.type ? { type: String(payload.type).toUpperCase() } : {}),
            ...(payload.value !== undefined ? { value: payload.value } : {}),
            ...(payload.minPurchase !== undefined ? { minPurchase: payload.minPurchase } : {}),
            ...(payload.usageLimit !== undefined ? { usageLimit: payload.usageLimit } : {}),
            ...(payload.usedCount !== undefined ? { usedCount: payload.usedCount } : {}),
            ...(payload.expiresAt ? { expiresAt } : {}),
            status: resolveVoucherStatus(payload.status || existingVoucher.status, expiresAt),
        },
    });

    return toVoucherResponse(voucher);
};

const deleteVoucher = async (id) => {
    const voucherId = Number(id);

    try {
        const voucher = await prisma.voucher.delete({
            where: { id: voucherId },
        });

        return toVoucherResponse(voucher);
    } catch (error) {
        throw new NotFoundError('Khong tim thay ma giam gia');
    }
};

const generateStaffCode = async () => {
    const START = 10000;
    const latest = await prisma.user.findFirst({
        where: { role: { in: [roles.STAFF, roles.MANAGER] }, staffCode: { not: null } },
        orderBy: { staffCode: 'desc' },
        select: { staffCode: true },
    });

    let next = START;
    if (latest?.staffCode) {
        const num = parseInt(latest.staffCode, 10);
        if (!isNaN(num)) next = num + 1;
    }

    return String(next).padStart(7, '0');
};

const toStaffResponse = (user) => ({
    id: String(user.id),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    staffCode: user.staffCode || '',
    branchId: user.branchId ? String(user.branchId) : '',
    branch: user.branch ? {
        id: String(user.branch.id),
        name: user.branch.name,
        code: user.branch.code,
    } : null,
    isActive: user.isActive,
    createdAt: user.createdAt,
});

const toBranchResponse = (branch) => ({
    id: String(branch.id),
    name: branch.name,
    code: branch.code,
    address: branch.address || '',
    phone: branch.phone || '',
    latitude: branch.latitude ?? null,
    longitude: branch.longitude ?? null,
    status: String(branch.status || '').toLowerCase(),
    staffCount: branch._count?.staff || 0,
    inventoryItems: branch._count?.inventory || 0,
    createdAt: branch.createdAt,
});

const normalizeBranchCode = (code) => String(code || '').trim().toUpperCase();

const ensureBranchUnique = async ({ code, address }, excludeId) => {
    const normalizedCode = code ? normalizeBranchCode(code) : undefined;
    const conditions = [];

    if (normalizedCode) conditions.push({ code: normalizedCode });
    if (address) conditions.push({ address: String(address).trim() });
    if (!conditions.length) return;

    const existing = await prisma.branch.findFirst({
        where: {
            OR: conditions,
            ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
        },
    });

    if (existing?.code === normalizedCode) {
        throw new BadRequestError('Mã chi nhánh đã tồn tại');
    }

    if (existing?.address === String(address || '').trim()) {
        throw new BadRequestError('Địa chỉ cửa hàng này đã là một chi nhánh');
    }
};

const getBranches = async () => {
    const branches = await prisma.branch.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
            _count: {
                select: { staff: true, inventory: true },
            },
        },
    });

    return branches.map(toBranchResponse);
};

const createBranch = async (payload) => {
    await ensureBranchUnique({ code: payload.code, address: payload.address });

    const branch = await prisma.$transaction(async (tx) => {
        const createdBranch = await tx.branch.create({
            data: {
                name: String(payload.name).trim(),
                code: normalizeBranchCode(payload.code),
                address: String(payload.address).trim(),
                phone: payload.phone ? String(payload.phone).trim() : null,
                latitude: payload.latitude !== undefined ? Number(payload.latitude) : null,
                longitude: payload.longitude !== undefined ? Number(payload.longitude) : null,
                status: payload.status || 'ACTIVE',
            },
        });

        const products = await tx.product.findMany({
            select: { id: true, minStock: true, maxStock: true },
        });

        if (products.length) {
            await tx.branchInventory.createMany({
                data: products.map((product) => ({
                    branchId: createdBranch.id,
                    productId: product.id,
                    stock: 0,
                    minStock: product.minStock || 5,
                    maxStock: product.maxStock || 20,
                })),
                skipDuplicates: true,
            });
        }

        return tx.branch.findUnique({
            where: { id: createdBranch.id },
            include: {
                _count: {
                    select: { staff: true, inventory: true },
                },
            },
        });
    });

    return toBranchResponse(branch);
};

const updateBranch = async (id, payload) => {
    const branchId = Number(id);
    const existing = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!existing) throw new NotFoundError('Không tìm thấy chi nhánh');

    await ensureBranchUnique({ code: payload.code, address: payload.address }, branchId);

    const branch = await prisma.branch.update({
        where: { id: branchId },
        data: {
            ...(payload.name !== undefined ? { name: String(payload.name).trim() } : {}),
            ...(payload.code !== undefined ? { code: normalizeBranchCode(payload.code) } : {}),
            ...(payload.address !== undefined ? { address: String(payload.address).trim() } : {}),
            ...(payload.phone !== undefined ? { phone: payload.phone ? String(payload.phone).trim() : null } : {}),
            ...(payload.latitude !== undefined ? { latitude: payload.latitude === null || payload.latitude === '' ? null : Number(payload.latitude) } : {}),
            ...(payload.longitude !== undefined ? { longitude: payload.longitude === null || payload.longitude === '' ? null : Number(payload.longitude) } : {}),
            ...(payload.status !== undefined ? { status: payload.status } : {}),
        },
        include: {
            _count: {
                select: { staff: true, inventory: true },
            },
        },
    });

    return toBranchResponse(branch);
};

const getStaffs = async () => {
    const users = await prisma.user.findMany({
        where: { role: roles.STAFF },
        orderBy: { createdAt: 'desc' },
        include: {
            branch: {
                select: { id: true, name: true, code: true },
            },
        },
    });
    return users.map(toStaffResponse);
};

const createStaff = async ({ fullName, email, phone, password, branchId }) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestError('Email này đã được sử dụng');

    const staffCode = await generateStaffCode();

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
        data: { fullName, email, phone: phone || null, password: hashedPassword, role: roles.STAFF, staffCode, branchId: branchId ? Number(branchId) : null },
        include: {
            branch: {
                select: { id: true, name: true, code: true },
            },
        },
    });
    return toStaffResponse(user);
};

const updateStaff = async (id, { fullName, email, phone, isActive, branchId }) => {
    const staffId = Number(id);
    const existing = await prisma.user.findUnique({ where: { id: staffId } });
    if (!existing || existing.role !== roles.STAFF) throw new NotFoundError('Không tìm thấy nhân viên');

    if (email && email !== existing.email) {
        const taken = await prisma.user.findUnique({ where: { email } });
        if (taken) throw new BadRequestError('Email này đã được sử dụng');
    }

    const user = await prisma.user.update({
        where: { id: staffId },
        data: {
            ...(fullName !== undefined && { fullName }),
            ...(email !== undefined && { email }),
            ...(phone !== undefined && { phone: phone || null }),
            ...(isActive !== undefined && { isActive }),
            ...(branchId !== undefined && { branchId: branchId ? Number(branchId) : null }),
        },
        include: {
            branch: {
                select: { id: true, name: true, code: true },
            },
        },
    });
    return toStaffResponse(user);
};

const deleteStaff = async (id) => {
    const staffId = Number(id);
    const existing = await prisma.user.findUnique({ where: { id: staffId } });
    if (!existing || existing.role !== roles.STAFF) throw new NotFoundError('Không tìm thấy nhân viên');

    const user = await prisma.user.update({
        where: { id: staffId },
        data: { isActive: false },
        include: {
            branch: {
                select: { id: true, name: true, code: true },
            },
        },
    });
    return toStaffResponse(user);
};

const regenerateStaffCode = async (id) => {
    const staffId = Number(id);
    const existing = await prisma.user.findUnique({ where: { id: staffId } });
    if (!existing || existing.role !== roles.STAFF) throw new NotFoundError('Không tìm thấy nhân viên');

    const staffCode = await generateStaffCode();
    const user = await prisma.user.update({
        where: { id: staffId },
        data: { staffCode },
        include: {
            branch: {
                select: { id: true, name: true, code: true },
            },
        },
    });
    return toStaffResponse(user);
};

const resetStaffPassword = async (id, newPassword) => {
    const staffId = Number(id);
    const existing = await prisma.user.findUnique({ where: { id: staffId } });
    if (!existing || existing.role !== roles.STAFF) throw new NotFoundError('Không tìm thấy nhân viên');

    const hashedPassword = await hashPassword(newPassword);
    const user = await prisma.user.update({
        where: { id: staffId },
        data: { password: hashedPassword },
    });
    return toStaffResponse(user);
};

const validatePosVoucher = async (code, subtotal) => {
    const voucher = await prisma.voucher.findFirst({
        where: {
            code: String(code).toUpperCase().trim(),
            status: 'ACTIVE',
            expiresAt: { gt: new Date() },
        },
    });

    if (!voucher) {
        throw new BadRequestError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }

    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
        throw new BadRequestError('Mã giảm giá đã hết lượt sử dụng');
    }

    const minPurchase = toNumber(voucher.minPurchase);
    if (subtotal < minPurchase) {
        throw new BadRequestError(`Đơn hàng tối thiểu ${minPurchase.toLocaleString('vi-VN')}đ để dùng mã này`);
    }

    const value = toNumber(voucher.value);
    const discountAmount = String(voucher.type).toUpperCase() === 'PERCENTAGE'
        ? Math.floor(subtotal * value / 100)
        : Math.min(value, subtotal);

    return {
        code: voucher.code,
        type: String(voucher.type).toLowerCase(),
        value,
        discountAmount,
    };
};

const toShiftCloseResponse = (record) => ({
    id: String(record.id),
    staffId: String(record.staffId),
    staffName: record.staff?.fullName || '',
    branchId: String(record.branchId),
    branchName: record.branch ? `${record.branch.code} - ${record.branch.name}` : '',
    businessDate: record.businessDate.toISOString(),
    closedAt: record.closedAt.toISOString(),
    orderCount: record.orderCount,
    storeOrderCount: record.storeOrderCount,
    onlineOrderCount: record.onlineOrderCount,
    revenue: toNumber(record.revenue),
    cashRevenue: toNumber(record.cashRevenue),
    transferRevenue: toNumber(record.transferRevenue),
    note: record.note || '',
});

const getShiftCloses = async (staffId) => {
    const staff = await getStaffWithBranch(staffId);
    const records = await prisma.shiftClose.findMany({
        where: { branchId: staff.branchId },
        orderBy: { closedAt: 'desc' },
        take: 20,
        include: {
            staff: { select: { fullName: true } },
            branch: { select: { name: true, code: true } },
        },
    });

    return records.map(toShiftCloseResponse);
};

const closeShift = async (staffId, { note } = {}) => {
    const staff = await getStaffWithBranch(staffId);
    const { start, end } = getTodayRange();
    const openedShift = await prisma.shiftSession.findFirst({
        where: {
            staffId: Number(staffId),
            branchId: staff.branchId,
            status: 'OPEN',
        },
        orderBy: { openedAt: 'desc' },
    });
    const shiftStart = openedShift?.openedAt || start;

    const orders = await prisma.order.findMany({
        where: {
            branchId: staff.branchId,
            createdAt: { gte: shiftStart, lt: end },
            status: { not: 'CANCELLED' },
        },
        select: {
            customerId: true,
            total: true,
            paymentMethod: true,
            paymentStatus: true,
        },
    });

    const paidOrders = orders.filter((order) => order.paymentStatus === 'PAID');
    const cashMethods = new Set(['CASH', 'COD']);

    const record = await prisma.shiftClose.create({
        data: {
            staffId: Number(staffId),
            branchId: staff.branchId,
            businessDate: shiftStart,
            orderCount: orders.length,
            storeOrderCount: orders.filter((order) => !order.customerId).length,
            onlineOrderCount: orders.filter((order) => order.customerId).length,
            revenue: paidOrders.reduce((sum, order) => sum + toNumber(order.total), 0),
            cashRevenue: paidOrders
                .filter((order) => cashMethods.has(order.paymentMethod))
                .reduce((sum, order) => sum + toNumber(order.total), 0),
            transferRevenue: paidOrders
                .filter((order) => !cashMethods.has(order.paymentMethod))
                .reduce((sum, order) => sum + toNumber(order.total), 0),
            note: note ? String(note).trim() : null,
        },
        include: {
            staff: { select: { fullName: true } },
            branch: { select: { name: true, code: true } },
        },
    });

    await prisma.shiftSession.upsert({
        where: { id: openedShift?.id || 0 },
        update: {
            status: 'CLOSED',
            closedAt: new Date(),
            orderCount: orders.length,
            storeOrderCount: orders.filter((order) => !order.customerId).length,
            onlineOrderCount: orders.filter((order) => order.customerId).length,
            revenue: paidOrders.reduce((sum, order) => sum + toNumber(order.total), 0),
            cashRevenue: paidOrders
                .filter((order) => cashMethods.has(order.paymentMethod))
                .reduce((sum, order) => sum + toNumber(order.total), 0),
            transferRevenue: paidOrders
                .filter((order) => !cashMethods.has(order.paymentMethod))
                .reduce((sum, order) => sum + toNumber(order.total), 0),
            note: note ? String(note).trim() : null,
        },
        create: {
            staffId: Number(staffId),
            branchId: staff.branchId,
            status: 'CLOSED',
            openedAt: start,
            closedAt: new Date(),
            orderCount: orders.length,
            storeOrderCount: orders.filter((order) => !order.customerId).length,
            onlineOrderCount: orders.filter((order) => order.customerId).length,
            revenue: paidOrders.reduce((sum, order) => sum + toNumber(order.total), 0),
            cashRevenue: paidOrders
                .filter((order) => cashMethods.has(order.paymentMethod))
                .reduce((sum, order) => sum + toNumber(order.total), 0),
            transferRevenue: paidOrders
                .filter((order) => !cashMethods.has(order.paymentMethod))
                .reduce((sum, order) => sum + toNumber(order.total), 0),
            note: note ? String(note).trim() : null,
        },
    });

    await prisma.shiftSession.create({
        data: {
            staffId: Number(staffId),
            branchId: staff.branchId,
            status: 'OPEN',
            openedAt: new Date(),
        },
    });

    return toShiftCloseResponse(record);
};

module.exports = {
    getCustomers,
    getBranches,
    createBranch,
    updateBranch,
    getDashboardOverview,
    getVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    getStaffs,
    createStaff,
    updateStaff,
    deleteStaff,
    regenerateStaffCode,
    resetStaffPassword,
    validatePosVoucher,
    getShiftCloses,
    closeShift,
};
