'use strict';

const { updateUserProfile } = require('../../shared/services');

module.exports = (userId, payload) => updateUserProfile(userId, payload);
