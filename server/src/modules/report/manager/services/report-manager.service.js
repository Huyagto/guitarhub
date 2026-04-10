'use strict';

const reportRepository = require('../../shared/repositories/report.repository');
const { toReportSummaryDto } = require('../../shared/dto/report.response.dto');

const getReportSummary = async () => toReportSummaryDto(reportRepository.getSummary());

module.exports = { getReportSummary };
