'use strict';

const sessions = new Map();

const saveSession = (session) => {
    sessions.set(session.orderCode, session);
    return session;
};

const getSession = (orderCode) => sessions.get(orderCode) || null;

const updateSession = (orderCode, patch) => {
    const currentSession = getSession(orderCode);
    if (!currentSession) return null;

    const nextSession = {
        ...currentSession,
        ...patch,
        updatedAt: new Date().toISOString(),
    };

    sessions.set(orderCode, nextSession);
    return nextSession;
};

module.exports = {
    saveSession,
    getSession,
    updateSession,
};
