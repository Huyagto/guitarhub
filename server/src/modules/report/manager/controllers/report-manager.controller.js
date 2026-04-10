'use strict';

const { OK } = require('../../../../core');
const reportManagerService = require('../services/report-manager.service');

const getReportSummary = async (req, res, next) => {
    try {
        const metadata = await reportManagerService.getReportSummary();
        return new OK({ message: 'Lấy dữ liệu báo cáo thành công', metadata }).send(res);
    } catch (error) {
        return next(error);
    }
};

module.exports = { getReportSummary };
