'use strict';

const { updateUserDefaultShippingAddress } = require('../../shared/services');

module.exports = (userId, payload) => updateUserDefaultShippingAddress(userId, payload);
