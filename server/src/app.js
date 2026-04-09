const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { clientOrigins } = require('./config');
const { errorMiddleware } = require('./core/middlewares');
const { customerAuthRoutes, staffAuthRoutes, managerAuthRoutes } = require('./modules/auth/routes');

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
