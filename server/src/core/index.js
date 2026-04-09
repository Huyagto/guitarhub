'use strict';

module.exports = {
    ...require('./error.response'),
    ...require('./success.response'),
    statusCodes: require('./statusCodes'),
    reasonPhrases: require('./reasonPhrases'),
    ...require('./middlewares'),
    ...require('./utils'),
};
