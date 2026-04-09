require('dotenv').config();
const app = require('./src/app');
const { database: prisma, redis, port } = require('./src/config');

const start = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to PostgreSQL database');

        await redis.connect();


        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

start();
