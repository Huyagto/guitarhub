'use strict';

const store = require('../../../management/data/management.store');

const getSummary = () => store.getReportsSummary();

module.exports = { getSummary };
