'use strict';

const { Server } = require('socket.io');
const { clientOrigins } = require('../config');
const { verifyAccessToken } = require('../core/utils');

const STAFF_ROOM = 'staff:orders';

let ioInstance = null;

const normalizeToken = (authHeader) => {
    if (!authHeader || typeof authHeader !== 'string') {
        return null;
    }

    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }

    return authHeader.trim();
};

const getUserRoom = (userId) => `customer:${userId}`;
const getStaffBranchRoom = (branchId) => `staff:orders:branch:${branchId}`;

const initSocketServer = (httpServer) => {
    ioInstance = new Server(httpServer, {
        cors: {
            origin(origin, callback) {
                if (!origin || clientOrigins.includes(origin)) {
                    return callback(null, true);
                }

                return callback(new Error(`Origin ${origin} is not allowed by Socket.IO`));
            },
            credentials: true,
        },
    });

    ioInstance.use((socket, next) => {
        try {
            const token = normalizeToken(socket.handshake.auth?.token || socket.handshake.headers.authorization);

            if (!token) {
                socket.data.user = null;
                return next();
            }

            socket.data.user = verifyAccessToken(token);
            return next();
        } catch (error) {
            return next(error);
        }
    });

    ioInstance.on('connection', (socket) => {
        const user = socket.data.user;

        if (user?.role === 'STAFF') {
            if (user.branchId) {
                socket.join(getStaffBranchRoom(user.branchId));
            } else {
                socket.join(STAFF_ROOM);
            }
        }

        if (user?.role === 'CUSTOMER' && user?.id) {
            socket.join(getUserRoom(user.id));
        }
    });

    return ioInstance;
};

const getSocketServer = () => ioInstance;

const emitOrderCreated = (order) => {
    if (!ioInstance) return;

    const branchId = order.branch?.id || order.branchId;
    if (branchId) {
        ioInstance.to(getStaffBranchRoom(branchId)).emit('order:created', order);
    } else {
        ioInstance.to(STAFF_ROOM).emit('order:created', order);
    }

    if (order.customerId) {
        ioInstance.to(getUserRoom(order.customerId)).emit('order:created', order);
    }
};

const emitOrderUpdated = (order) => {
    if (!ioInstance) return;

    const branchId = order.branch?.id || order.branchId;
    if (branchId) {
        ioInstance.to(getStaffBranchRoom(branchId)).emit('order:updated', order);
    } else {
        ioInstance.to(STAFF_ROOM).emit('order:updated', order);
    }

    if (order.customerId) {
        ioInstance.to(getUserRoom(order.customerId)).emit('order:updated', order);
    }
};

module.exports = {
    STAFF_ROOM,
    getStaffBranchRoom,
    getUserRoom,
    initSocketServer,
    getSocketServer,
    emitOrderCreated,
    emitOrderUpdated,
};
