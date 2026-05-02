require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { database: prisma, redis, port } = require('./src/config');
const { initSocketServer } = require('./src/realtime/socket.server');

const start = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to PostgreSQL database');

        await redis.connect();

        const server = http.createServer(app);
        initSocketServer(server);

        server.listen(port, () => {
            console.log(`Server running on http://127.0.0.1:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

start();
