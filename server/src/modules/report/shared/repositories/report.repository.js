'use strict';

const { database: prisma } = require('../../../../config');
const { roles } = require('../../../auth/constants');

const CHART_FILLS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
const REPORT_WINDOW_DAYS = 30;

const toNumber = (value) => Number(value || 0);

const getMonthSlots = (count = 12) => {
    const now = new Date();

    return Array.from({ length: count }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);

        return {
            month: date.toLocaleString('en-US', { month: 'short' }),
            startAt: date,
            endAt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
        };
    });
};

const calculatePercentChange = (currentValue, previousValue) => {
    if (!previousValue) {
        return currentValue > 0 ? 100 : 0;
    }

    return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
};

const resolveInventoryStatus = (stock, minStock) => {
    if (stock <= 0) return 'out-of-stock';
    if (stock <= minStock) return 'low-stock';
    return 'in-stock';
};

const isStoreOrder = (order) => {
    const shippingInfo = order.shippingInfo && typeof order.shippingInfo === 'object' ? order.shippingInfo : {};
    return shippingInfo.type === 'pos' || !order.customerId;
};

const buildInventoryItem = (product) => ({
    id: String(product.id),
    productId: String(product.id),
    productName: product.name,
    sku: product.sku,
    currentStock: product.stock,
    minStock: product.minStock,
    maxStock: product.maxStock,
    status: resolveInventoryStatus(product.stock, product.minStock),
    lastRestocked: product.lastRestockedAt.toISOString(),
});

const resolveDateFilter = ({ startDate, endDate } = {}) => {
    const createdAt = {};
    if (startDate) createdAt.gte = new Date(startDate);
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        createdAt.lte = end;
    }

    return Object.keys(createdAt).length ? createdAt : undefined;
};

const fetchAnalyticsSnapshot = async ({ branchId, startDate, endDate } = {}) => {
    const createdAt = resolveDateFilter({ startDate, endDate });
    const orderWhere = {
        ...(branchId ? { branchId: Number(branchId) } : {}),
        ...(createdAt ? { createdAt } : {}),
    };

    const [orders, products, customers] = await Promise.all([
        prisma.order.findMany({
            where: orderWhere,
            include: {
                branch: {
                    select: { id: true, name: true, code: true },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                category: {
                                    select: { name: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.product.findMany({
            include: {
                category: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.findMany({
            where: { role: roles.CUSTOMER },
            include: {
                orders: {
                    select: { total: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    return { orders, products, customers };
};

const buildKpi = ({ orders, customers }) => {
    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - REPORT_WINDOW_DAYS);

    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - REPORT_WINDOW_DAYS);

    const currentOrders = orders.filter((order) => order.createdAt >= currentPeriodStart);
    const previousOrders = orders.filter(
        (order) => order.createdAt >= previousPeriodStart && order.createdAt < currentPeriodStart,
    );
    const currentCustomers = customers.filter((customer) => customer.createdAt >= currentPeriodStart);
    const previousCustomers = customers.filter(
        (customer) => customer.createdAt >= previousPeriodStart && customer.createdAt < currentPeriodStart,
    );

    const currentRevenue = currentOrders.reduce((sum, order) => sum + toNumber(order.total), 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + toNumber(order.total), 0);
    const currentAvgOrderValue = currentOrders.length ? currentRevenue / currentOrders.length : 0;
    const previousAvgOrderValue = previousOrders.length ? previousRevenue / previousOrders.length : 0;

    return {
        totalRevenue: currentRevenue,
        revenueChange: calculatePercentChange(currentRevenue, previousRevenue),
        totalOrders: currentOrders.length,
        ordersChange: calculatePercentChange(currentOrders.length, previousOrders.length),
        totalCustomers: currentCustomers.length,
        customersChange: calculatePercentChange(currentCustomers.length, previousCustomers.length),
        avgOrderValue: currentAvgOrderValue,
        avgOrderChange: calculatePercentChange(currentAvgOrderValue, previousAvgOrderValue),
    };
};

const buildMonthlyData = (orders, customers, products) => {
    const slots = getMonthSlots(12);

    return slots.map((slot) => {
        const monthOrders = orders.filter(
            (order) => order.createdAt >= slot.startAt && order.createdAt < slot.endAt,
        );
        const monthCustomers = customers.filter(
            (customer) => customer.createdAt >= slot.startAt && customer.createdAt < slot.endAt,
        );
        const monthProducts = products.filter(
            (product) => product.createdAt >= slot.startAt && product.createdAt < slot.endAt,
        );

        return {
            month: slot.month,
            sales: monthOrders.reduce((sum, order) => sum + toNumber(order.total), 0),
            orders: monthOrders.length,
            onlineOrders: monthOrders.filter((order) => !isStoreOrder(order)).length,
            storeOrders: monthOrders.filter(isStoreOrder).length,
            onlineRevenue: monthOrders
                .filter((order) => !isStoreOrder(order))
                .reduce((sum, order) => sum + toNumber(order.total), 0),
            storeRevenue: monthOrders
                .filter(isStoreOrder)
                .reduce((sum, order) => sum + toNumber(order.total), 0),
            customers: monthCustomers.length,
            products: monthProducts.length,
        };
    });
};

const buildOrderChannels = (orders) => {
    const onlineOrders = orders.filter((order) => !isStoreOrder(order));
    const storeOrders = orders.filter(isStoreOrder);

    const sumRevenue = (items) => items.reduce((sum, order) => sum + toNumber(order.total), 0);

    return {
        online: {
            orders: onlineOrders.length,
            revenue: sumRevenue(onlineOrders),
        },
        store: {
            orders: storeOrders.length,
            revenue: sumRevenue(storeOrders),
        },
    };
};

const buildBranchBreakdown = (orders) => {
    const stats = new Map();

    for (const order of orders) {
        const key = order.branchId || 'unknown';
        const current = stats.get(key) || {
            branchId: order.branchId ? String(order.branchId) : null,
            branchName: order.branch?.name || 'Chua gan chi nhanh',
            orders: 0,
            revenue: 0,
        };

        current.orders += 1;
        current.revenue += toNumber(order.total);
        stats.set(key, current);
    }

    return Array.from(stats.values()).sort((a, b) => b.revenue - a.revenue);
};

const buildCategoryDistribution = (orders, products) => {
    const revenueByCategory = new Map();

    for (const order of orders) {
        for (const item of order.items) {
            const categoryName = item.product?.category?.name || 'Khac';
            const lineRevenue = toNumber(item.unitPrice) * item.quantity;
            revenueByCategory.set(categoryName, (revenueByCategory.get(categoryName) || 0) + lineRevenue);
        }
    }

    if (!revenueByCategory.size) {
        for (const product of products) {
            const categoryName = product.category?.name || 'Khac';
            revenueByCategory.set(categoryName, (revenueByCategory.get(categoryName) || 0) + 1);
        }
    }

    const total = Array.from(revenueByCategory.values()).reduce((sum, value) => sum + value, 0);

    return Array.from(revenueByCategory.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value], index) => ({
            name,
            value: total ? Number(((value / total) * 100).toFixed(1)) : 0,
            fill: CHART_FILLS[index % CHART_FILLS.length],
        }));
};

const buildTopProducts = (orders) => {
    const stats = new Map();

    for (const order of orders) {
        for (const item of order.items) {
            const current = stats.get(item.productId) || {
                name: item.productName,
                sales: 0,
                revenue: 0,
            };

            current.sales += item.quantity;
            current.revenue += toNumber(item.unitPrice) * item.quantity;
            stats.set(item.productId, current);
        }
    }

    return Array.from(stats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
};

const buildRecentOrders = (orders) => {
    return orders.slice(0, 5).map((order) => ({
        id: String(order.id),
        customerId: order.customerId ? String(order.customerId) : null,
        orderNumber: order.orderNumber,
        customer: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone || '',
        items: order.items.reduce((sum, item) => sum + item.quantity, 0),
        total: toNumber(order.total),
        status: String(order.status || '').toLowerCase(),
        paymentStatus: String(order.paymentStatus || '').toLowerCase(),
        source: isStoreOrder(order) ? 'store' : 'online',
        createdAt: order.createdAt.toISOString(),
    }));
};

const buildLowStockItems = (products) => products
    .map(buildInventoryItem)
    .filter((item) => item.status === 'low-stock' || item.status === 'out-of-stock')
    .sort((a, b) => a.currentStock - b.currentStock)
    .slice(0, 8);

const getDashboardOverview = async (filters) => {
    const snapshot = await fetchAnalyticsSnapshot(filters);
    const monthlyData = buildMonthlyData(snapshot.orders, snapshot.customers, snapshot.products);

    return {
        kpi: buildKpi(snapshot),
        salesChartData: monthlyData.map(({ month, sales, orders }) => ({ month, sales, orders })),
        orderChannels: buildOrderChannels(snapshot.orders),
        categoryDistribution: buildCategoryDistribution(snapshot.orders, snapshot.products),
        recentOrders: buildRecentOrders(snapshot.orders),
        lowStockItems: buildLowStockItems(snapshot.products),
    };
};

const getSummary = async (filters = {}) => {
    const snapshot = await fetchAnalyticsSnapshot(filters);
    const monthlyData = buildMonthlyData(snapshot.orders, snapshot.customers, snapshot.products);

    return {
        kpi: buildKpi(snapshot),
        salesChartData: monthlyData.map(({ month, sales, orders }) => ({ month, sales, orders })),
        orderChannels: buildOrderChannels(snapshot.orders),
        branchBreakdown: buildBranchBreakdown(snapshot.orders),
        categoryDistribution: buildCategoryDistribution(snapshot.orders, snapshot.products).map(({ name, value }) => ({
            name,
            value,
        })),
        recentOrders: buildRecentOrders(snapshot.orders),
        lowStockItems: buildLowStockItems(snapshot.products),
        monthlyData,
        topProducts: buildTopProducts(snapshot.orders),
    };
};

module.exports = {
    getDashboardOverview,
    getSummary,
};
