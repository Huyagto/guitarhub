const { PrismaClient } = require('../generated/prisma/index.js');

const shouldLogQueries = String(process.env.PRISMA_LOG_QUERIES).toLowerCase() === 'true';

const prisma = new PrismaClient({
    log: shouldLogQueries ? ['query', 'error'] : ['error'],
});

module.exports = prisma;
