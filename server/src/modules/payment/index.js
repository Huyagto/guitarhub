'use strict';

module.exports = {
  customer: require('./customer'),
  staff: require('./staff'),
  manager: require('./manager'),
  shared: require('./shared'),
  paymentCustomerRoutes: require('./customer/routes').paymentCustomerRoutes,
};

