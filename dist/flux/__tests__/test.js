'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _commentsServer = require('../comments/server');

var _commentsServer2 = _interopRequireDefault(_commentsServer);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _ = require('lodash');
var should = require('should');
var Promise = (global || window).Promise = require('bluebird');
var __DEV__ = process.env.NODE_ENV !== 'production';
var __PROD__ = !__DEV__;
var __BROWSER__ = typeof window === 'object';
var __NODE__ = !__BROWSER__;
if (__DEV__) {
  Promise.longStackTraces();
  Error.stackTraceLimit = Infinity;
}

var configFlux = {
  port: _config2['default'].comments.flux.port,
  postgresql: {
    macros: _config2['default'].macros,
    sql: _config2['default'].comments['flux-sql']
  },
  logger: _config2['default'].logger,
  sso: {
    url: _config2['default'].sso['flux-www'].url
  },
  redis: {
    host: _config2['default'].comments['flux-mq'].host,
    port: _config2['default'].comments['flux-mq'].port,
    channel: _config2['default'].redis.channel
  }
};

var fluxCommentsSocketIOServer = new _commentsServer2['default'](configFlux);