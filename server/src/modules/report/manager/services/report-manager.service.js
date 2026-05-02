'use strict';

const reportRepository = require('../../shared/repositories/report.repository');
const { toReportSummaryDto } = require('../../shared/dto/report.response.dto');

const getReportSummary = async (query) => toReportSummaryDto(reportRepository.getSummary(query));

module.exports = { getReportSummary };
