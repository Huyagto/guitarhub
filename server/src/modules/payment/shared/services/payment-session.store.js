'use strict';

const { redis } = require('../../../../config');

const sessions = new Map();
const SESSION_TTL_SECONDS = 60 * 60 * 24;
const keyForOrder = (orderCode) => `payment-session:${orderCode}`;

const saveSession = async (session) => {
    sessions.set(session.orderCode, session);
    await redis.set(keyForOrder(session.orderCode), JSON.stringify(session), 'EX', SESSION_TTL_SECONDS);
    return session;
};

const getSession = async (orderCode) => {
    const memorySession = sessions.get(orderCode);
    if (memorySession) return memorySession;

    const rawSession = await redis.get(keyForOrder(orderCode));
    if (!rawSession) return null;

    const session = JSON.parse(rawSession);
    sessions.set(orderCode, session);
    return session;
};

const updateSession = async (orderCode, patch) => {
    const currentSession = await getSession(orderCode);
    if (!currentSession) return null;

    const nextSession = {
        ...currentSession,
        ...patch,
        updatedAt: new Date().toISOString(),
    };

    sessions.set(orderCode, nextSession);
    await redis.set(keyForOrder(orderCode), JSON.stringify(nextSession), 'EX', SESSION_TTL_SECONDS);
    return nextSession;
};

module.exports = {
    saveSession,
    getSession,
    updateSession,
};
