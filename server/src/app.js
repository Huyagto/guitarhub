const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { clientOrigins } = require('./config');
const { errorMiddleware } = require('./core/middlewares');
const { customerAuthRoutes, staffAuthRoutes, managerAuthRoutes } = require('./modules/auth/routes');
const { customerProductRoutes, staffProductRoutes, managerProductRoutes } = require('./modules/product');
const { customerCategoryRoutes, staffCategoryRoutes, managerCategoryRoutes } = require('./modules/category');
const { customerBrandRoutes, managerBrandRoutes } = require('./modules/brand');
const { customerCartRoutes } = require('./modules/cart');
const { paymentCustomerRoutes } = require('./modules/payment');
const { customerOrderRoutes, managerOrderRoutes, staffOrderRoutes } = require('./modules/order');
const { managerInventoryRoutes, staffInventoryRoutes } = require('./modules/inventory');
const { managerReportRoutes } = require('./modules/report');
const { managerManagementRoutes, staffManagementRoutes } = require('./modules/management');
const { managerUploadRoutes } = require('./modules/upload');

const app = express();

app.use(cors({
    origin(origin, callback) {
        if (!origin || clientOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', customerAuthRoutes);
app.use('/api/staff/auth', staffAuthRoutes);
app.use('/api/manager/auth', managerAuthRoutes);
app.use('/api/products', customerProductRoutes);
app.use('/api/categories', customerCategoryRoutes);
app.use('/api/brands', customerBrandRoutes);
app.use('/api/cart', customerCartRoutes);
app.use('/api/payments', paymentCustomerRoutes);
app.use('/api/orders', customerOrderRoutes);
app.use('/api/staff/products', staffProductRoutes);
app.use('/api/staff/categories', staffCategoryRoutes);
app.use('/api/staff/orders', staffOrderRoutes);
app.use('/api/manager/products', managerProductRoutes);
app.use('/api/manager/categories', managerCategoryRoutes);
app.use('/api/manager/brands', managerBrandRoutes);
app.use('/api/manager/orders', managerOrderRoutes);
app.use('/api/manager/inventory', managerInventoryRoutes);
app.use('/api/staff/inventory', staffInventoryRoutes);
app.use('/api/manager/reports', managerReportRoutes);
app.use('/api/manager/uploads', managerUploadRoutes);
app.use('/api/manager', managerManagementRoutes);
app.use('/api/staff/pos', staffManagementRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Đường dẫn không tồn tại' });
});

// Global error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
