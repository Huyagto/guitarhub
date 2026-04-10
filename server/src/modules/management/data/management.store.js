'use strict';

const clone = (value) => JSON.parse(JSON.stringify(value));

const state = {
    dashboard: {
        kpi: {
            totalRevenue: 284750,
            revenueChange: 12.5,
            totalOrders: 1247,
            ordersChange: 8.2,
            totalCustomers: 3842,
            customersChange: 15.3,
            avgOrderValue: 228.35,
            avgOrderChange: -2.1,
        },
        salesChartData: [
            { month: 'Jan', sales: 18500, orders: 89 },
            { month: 'Feb', sales: 22300, orders: 112 },
            { month: 'Mar', sales: 19800, orders: 98 },
            { month: 'Apr', sales: 28400, orders: 142 },
            { month: 'May', sales: 31200, orders: 156 },
            { month: 'Jun', sales: 26800, orders: 134 },
            { month: 'Jul', sales: 34500, orders: 172 },
            { month: 'Aug', sales: 29700, orders: 148 },
            { month: 'Sep', sales: 27300, orders: 136 },
            { month: 'Oct', sales: 32100, orders: 160 },
            { month: 'Nov', sales: 38900, orders: 194 },
            { month: 'Dec', sales: 42600, orders: 213 },
        ],
        categoryDistribution: [
            { name: 'Electric Guitars', value: 35, fill: 'var(--chart-1)' },
            { name: 'Acoustic Guitars', value: 28, fill: 'var(--chart-2)' },
            { name: 'Bass Guitars', value: 15, fill: 'var(--chart-3)' },
            { name: 'Amplifiers', value: 12, fill: 'var(--chart-4)' },
            { name: 'Accessories', value: 10, fill: 'var(--chart-5)' },
        ],
    },
    products: [
        { id: '1', name: 'Fender Stratocaster American Pro II', sku: 'FEN-STRAT-AP2-BLK', category: 'Electric Guitars', brand: 'Fender', price: 1799.99, stock: 12, status: 'active', image: '/placeholder.svg?height=80&width=80', createdAt: '2024-01-15' },
        { id: '2', name: 'Gibson Les Paul Standard 50s', sku: 'GIB-LP-STD50-HB', category: 'Electric Guitars', brand: 'Gibson', price: 2499.99, stock: 8, status: 'active', image: '/placeholder.svg?height=80&width=80', createdAt: '2024-01-12' },
        { id: '3', name: 'Taylor 814ce Builder\'s Edition', sku: 'TAY-814CE-BE', category: 'Acoustic Guitars', brand: 'Taylor', price: 3999.99, stock: 4, status: 'active', image: '/placeholder.svg?height=80&width=80', createdAt: '2024-01-10' },
        { id: '4', name: 'Martin D-28 Standard', sku: 'MAR-D28-STD', category: 'Acoustic Guitars', brand: 'Martin', price: 3299.99, stock: 6, status: 'active', image: '/placeholder.svg?height=80&width=80', createdAt: '2024-01-08' },
        { id: '5', name: 'Fender Jazz Bass American Ultra', sku: 'FEN-JB-ULTRA-SB', category: 'Bass Guitars', brand: 'Fender', price: 2199.99, stock: 5, status: 'active', image: '/placeholder.svg?height=80&width=80', createdAt: '2024-01-05' },
        { id: '6', name: 'Marshall JVM410H Head', sku: 'MAR-JVM410H', category: 'Amplifiers', brand: 'Marshall', price: 1999.99, stock: 3, status: 'active', image: '/placeholder.svg?height=80&width=80', createdAt: '2024-01-03' },
        { id: '7', name: 'PRS Custom 24-08', sku: 'PRS-C24-08-EM', category: 'Electric Guitars', brand: 'PRS', price: 4299.99, stock: 2, status: 'active', image: '/placeholder.svg?height=80&width=80', createdAt: '2024-01-01' },
        { id: '8', name: 'Ibanez RG550 Genesis', sku: 'IBN-RG550-GEN', category: 'Electric Guitars', brand: 'Ibanez', price: 999.99, stock: 15, status: 'active', image: '/placeholder.svg?height=80&width=80', createdAt: '2023-12-28' },
        { id: '9', name: 'Boss Katana-100 MkII', sku: 'BOSS-KAT100-MK2', category: 'Amplifiers', brand: 'Boss', price: 399.99, stock: 0, status: 'draft', image: '/placeholder.svg?height=80&width=80', createdAt: '2023-12-25' },
        { id: '10', name: 'Ernie Ball Music Man StingRay', sku: 'EBMM-SRAY-BLK', category: 'Bass Guitars', brand: 'Ernie Ball', price: 2399.99, stock: 4, status: 'active', image: '/placeholder.svg?height=80&width=80', createdAt: '2023-12-20' },
    ],
    categories: [
        { id: '1', name: 'Electric Guitars', description: 'Solid body and semi-hollow electric guitars', productCount: 45, status: 'active' },
        { id: '2', name: 'Acoustic Guitars', description: 'Steel-string and classical acoustic guitars', productCount: 32, status: 'active' },
        { id: '3', name: 'Bass Guitars', description: 'Electric and acoustic bass guitars', productCount: 18, status: 'active' },
        { id: '4', name: 'Amplifiers', description: 'Guitar and bass amplifiers, combos and heads', productCount: 24, status: 'active' },
        { id: '5', name: 'Effects Pedals', description: 'Stompboxes, multi-effects, and pedalboards', productCount: 56, status: 'active' },
        { id: '6', name: 'Accessories', description: 'Strings, picks, straps, cases, and more', productCount: 128, status: 'active' },
        { id: '7', name: 'Recording Equipment', description: 'Audio interfaces, microphones, and monitors', productCount: 15, status: 'inactive' },
    ],
    brands: [
        { id: '1', name: 'Fender', logo: '/placeholder.svg?height=40&width=40', productCount: 38, status: 'active' },
        { id: '2', name: 'Gibson', logo: '/placeholder.svg?height=40&width=40', productCount: 28, status: 'active' },
        { id: '3', name: 'Taylor', logo: '/placeholder.svg?height=40&width=40', productCount: 22, status: 'active' },
        { id: '4', name: 'Martin', logo: '/placeholder.svg?height=40&width=40', productCount: 18, status: 'active' },
        { id: '5', name: 'PRS', logo: '/placeholder.svg?height=40&width=40', productCount: 15, status: 'active' },
        { id: '6', name: 'Ibanez', logo: '/placeholder.svg?height=40&width=40', productCount: 32, status: 'active' },
        { id: '7', name: 'Marshall', logo: '/placeholder.svg?height=40&width=40', productCount: 12, status: 'active' },
        { id: '8', name: 'Boss', logo: '/placeholder.svg?height=40&width=40', productCount: 45, status: 'active' },
    ],
    orders: [
        { id: '1', orderNumber: 'ORD-2024-001247', customer: 'John Smith', email: 'john.smith@email.com', items: 3, total: 2847.97, status: 'delivered', paymentStatus: 'paid', createdAt: '2024-03-15T10:30:00' },
        { id: '2', orderNumber: 'ORD-2024-001246', customer: 'Sarah Johnson', email: 'sarah.j@email.com', items: 1, total: 1799.99, status: 'shipped', paymentStatus: 'paid', createdAt: '2024-03-14T15:45:00' },
        { id: '3', orderNumber: 'ORD-2024-001245', customer: 'Mike Williams', email: 'mike.w@email.com', items: 5, total: 456.45, status: 'processing', paymentStatus: 'paid', createdAt: '2024-03-14T09:20:00' },
        { id: '4', orderNumber: 'ORD-2024-001244', customer: 'Emily Davis', email: 'emily.d@email.com', items: 2, total: 3499.98, status: 'pending', paymentStatus: 'pending', createdAt: '2024-03-13T16:10:00' },
        { id: '5', orderNumber: 'ORD-2024-001243', customer: 'David Brown', email: 'david.b@email.com', items: 1, total: 2499.99, status: 'delivered', paymentStatus: 'paid', createdAt: '2024-03-13T11:05:00' },
        { id: '6', orderNumber: 'ORD-2024-001242', customer: 'Lisa Anderson', email: 'lisa.a@email.com', items: 4, total: 892.5, status: 'cancelled', paymentStatus: 'refunded', createdAt: '2024-03-12T14:30:00' },
    ],
    customers: [
        { id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '+1 (555) 123-4567', totalOrders: 12, totalSpent: 15847.5, status: 'active', joinedAt: '2022-06-15' },
        { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1 (555) 234-5678', totalOrders: 8, totalSpent: 9245.8, status: 'active', joinedAt: '2022-08-22' },
        { id: '3', name: 'Mike Williams', email: 'mike.w@email.com', phone: '+1 (555) 345-6789', totalOrders: 23, totalSpent: 28450.25, status: 'active', joinedAt: '2021-11-03' },
        { id: '4', name: 'Emily Davis', email: 'emily.d@email.com', phone: '+1 (555) 456-7890', totalOrders: 5, totalSpent: 6899.95, status: 'active', joinedAt: '2023-02-14' },
        { id: '5', name: 'David Brown', email: 'david.b@email.com', phone: '+1 (555) 567-8901', totalOrders: 15, totalSpent: 18750, status: 'active', joinedAt: '2022-01-28' },
        { id: '6', name: 'Lisa Anderson', email: 'lisa.a@email.com', phone: '+1 (555) 678-9012', totalOrders: 3, totalSpent: 2547.5, status: 'inactive', joinedAt: '2023-07-10' },
    ],
    inventory: [
        { id: '1', productId: '1', productName: 'Fender Stratocaster American Pro II', sku: 'FEN-STRAT-AP2-BLK', currentStock: 12, minStock: 5, maxStock: 25, status: 'in-stock', lastRestocked: '2024-03-10' },
        { id: '2', productId: '2', productName: 'Gibson Les Paul Standard 50s', sku: 'GIB-LP-STD50-HB', currentStock: 8, minStock: 3, maxStock: 15, status: 'in-stock', lastRestocked: '2024-03-08' },
        { id: '3', productId: '3', productName: 'Taylor 814ce Builder\'s Edition', sku: 'TAY-814CE-BE', currentStock: 4, minStock: 2, maxStock: 10, status: 'in-stock', lastRestocked: '2024-03-05' },
        { id: '4', productId: '6', productName: 'Marshall JVM410H Head', sku: 'MAR-JVM410H', currentStock: 3, minStock: 5, maxStock: 12, status: 'low-stock', lastRestocked: '2024-02-28' },
        { id: '5', productId: '7', productName: 'PRS Custom 24-08', sku: 'PRS-C24-08-EM', currentStock: 2, minStock: 3, maxStock: 8, status: 'low-stock', lastRestocked: '2024-02-25' },
        { id: '6', productId: '9', productName: 'Boss Katana-100 MkII', sku: 'BOSS-KAT100-MK2', currentStock: 0, minStock: 8, maxStock: 20, status: 'out-of-stock', lastRestocked: '2024-02-15' },
    ],
    vouchers: [
        { id: '1', code: 'SPRING2024', type: 'percentage', value: 15, minPurchase: 100, usageLimit: 500, usedCount: 234, status: 'active', expiresAt: '2024-04-30' },
        { id: '2', code: 'GUITAR20', type: 'percentage', value: 20, minPurchase: 500, usageLimit: 200, usedCount: 156, status: 'active', expiresAt: '2024-05-15' },
        { id: '3', code: 'NEWCUSTOMER', type: 'fixed', value: 50, minPurchase: 200, usageLimit: 1000, usedCount: 892, status: 'active', expiresAt: '2024-12-31' },
        { id: '4', code: 'VIP100', type: 'fixed', value: 100, minPurchase: 1000, usageLimit: 50, usedCount: 50, status: 'expired', expiresAt: '2024-02-28' },
    ],
    posCategories: [
        { id: 'all', name: 'Tất cả sản phẩm' },
        { id: 'acoustic', name: 'Guitar Acoustic' },
        { id: 'electric', name: 'Guitar Electric' },
        { id: 'bass', name: 'Guitar Bass' },
        { id: 'classical', name: 'Guitar Classic' },
        { id: 'accessories', name: 'Phụ kiện' },
    ],
    posProducts: [
        { id: '1', name: 'Taylor 214ce', price: 24500000, category: 'acoustic', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop', stock: 5, sku: 'TAY-214CE' },
        { id: '2', name: 'Martin D-28', price: 68000000, category: 'acoustic', image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=300&h=300&fit=crop', stock: 3, sku: 'MAR-D28' },
        { id: '3', name: 'Fender Stratocaster', price: 32000000, category: 'electric', image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=300&h=300&fit=crop', stock: 8, sku: 'FEN-STRAT' },
        { id: '4', name: 'Gibson Les Paul Standard', price: 58000000, category: 'electric', image: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=300&h=300&fit=crop', stock: 2, sku: 'GIB-LP-STD' },
        { id: '5', name: 'Fender Jazz Bass', price: 35000000, category: 'bass', image: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=300&h=300&fit=crop', stock: 4, sku: 'FEN-JAZZ-B' },
        { id: '6', name: 'Cordoba C5', price: 8500000, category: 'classical', image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=300&h=300&fit=crop', stock: 12, sku: 'COR-C5' },
        { id: '7', name: 'Guitar Strings Set', price: 250000, category: 'accessories', image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=300&h=300&fit=crop', stock: 50, sku: 'ACC-STR-01' },
        { id: '8', name: 'Guitar Capo', price: 150000, category: 'accessories', image: 'https://images.unsplash.com/photo-1598449356475-b9f71db7d847?w=300&h=300&fit=crop', stock: 30, sku: 'ACC-CAPO' },
    ],
};

const collections = ['products', 'categories', 'brands', 'orders', 'customers', 'inventory', 'vouchers'];

const getCollection = (name) => clone(state[name]);

const nextId = (items) => String(Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1);

const createItem = (name, payload) => {
    const item = {
        id: nextId(state[name]),
        ...payload,
    };
    state[name].unshift(item);
    return clone(item);
};

const updateItem = (name, id, payload) => {
    const index = state[name].findIndex((item) => item.id === id);
    if (index === -1) return null;
    state[name][index] = { ...state[name][index], ...payload };
    return clone(state[name][index]);
};

const removeItem = (name, id) => {
    const index = state[name].findIndex((item) => item.id === id);
    if (index === -1) return null;
    const [removed] = state[name].splice(index, 1);
    return clone(removed);
};

const getDashboardOverview = () => ({
    ...clone(state.dashboard),
    recentOrders: clone(state.orders.slice(0, 5)),
    lowStockItems: clone(state.inventory.filter((item) => item.status === 'low-stock' || item.status === 'out-of-stock')),
});

const getReportsSummary = () => {
    const monthlyData = state.dashboard.salesChartData.map((item, index) => ({
        ...item,
        customers: 150 + (index * 12),
        products: 80 + (index * 4),
    }));

    const topProducts = [
        { name: 'Fender Stratocaster', sales: 45, revenue: 80998 },
        { name: 'Gibson Les Paul', sales: 32, revenue: 79999 },
        { name: 'Taylor 814ce', sales: 28, revenue: 111999 },
        { name: 'PRS Custom 24', sales: 24, revenue: 103199 },
        { name: 'Marshall JVM410H', sales: 21, revenue: 41999 },
    ];

    return {
        ...clone(state.dashboard),
        monthlyData,
        topProducts,
    };
};

const restockInventoryItem = (id, quantity) => {
    const item = state.inventory.find((inventoryItem) => inventoryItem.id === id);
    if (!item) return null;

    item.currentStock += quantity;
    item.lastRestocked = new Date().toISOString().split('T')[0];
    item.status = item.currentStock === 0
        ? 'out-of-stock'
        : item.currentStock < item.minStock
            ? 'low-stock'
            : 'in-stock';

    const product = state.products.find((productItem) => productItem.id === item.productId);
    if (product) {
        product.stock = item.currentStock;
    }

    return clone(item);
};

const updateOrderStatus = (id, status) => updateItem('orders', id, { status });

const getPosCatalog = () => ({
    categories: clone(state.posCategories),
    products: clone(state.posProducts),
});

module.exports = {
    collections,
    getCollection,
    createItem,
    updateItem,
    removeItem,
    getDashboardOverview,
    getReportsSummary,
    restockInventoryItem,
    updateOrderStatus,
    getPosCatalog,
};
