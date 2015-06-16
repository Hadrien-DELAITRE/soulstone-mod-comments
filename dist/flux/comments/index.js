'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _actions = require('./actions');

var _nexusFluxSocketIoClient = require('nexus-flux-socket.io/client');

var _nexusFluxSocketIoClient2 = _interopRequireDefault(_nexusFluxSocketIoClient);

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _nexusFlux = require('nexus-flux');

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

var runFluxServer = function runFluxServer(config) {
  var fluxServerComments = new _server2['default'](config.comments.flux.port);
  var fluxClientSSO = new _nexusFluxSocketIoClient2['default'](config.sso['flux-www'].url);

  var fluxCommentsMQ = config.comments['flux-mq'];
  var redisClientPublisher = _redis2['default'].createClient(fluxCommentsMQ.port, fluxCommentsMQ.host);
  var redisClientSubscriber = _redis2['default'].createClient(fluxCommentsMQ.port, fluxCommentsMQ.host);
  var actionRedis = 'action_' + config.redis.channel;
  var updateRedis = 'update_' + config.redis.channel;

  var tokensLifespan = new _nexusFlux.Lifespan();
  var tokens = fluxClientSSO.getStore('/sso/validTokensHashes', tokensLifespan).onUpdate(function () {
    return void 0;
  }).onDelete(function () {
    return void 0;
  });

  var serverActions = (0, _actions.createActions)(redisClientPublisher, actionRedis, tokens);

  fluxServerComments.on('action', function (_ref) {
    var path = _ref.path;
    var params = _ref.params;

    if (serverActions[path] !== void 0) {
      serverActions[path](params);
    }
  });

  // manage redis subscription
  redisClientSubscriber.subscribe(updateRedis);
  redisClientSubscriber.on('message', function (channel, message) {
    if (message !== '' && channel === updateRedis) {
      var jsonResult = JSON.parse(message);
      if (__DEV__) {
        console.log('message', message);
        console.log('channel', channel);
      }
      try {
        jsonResult.should.have.property('n');
        jsonResult.should.have.property('p');
        var path = jsonResult.n;
        var patchUpdate = _nexusFlux.Remutable.Patch.fromJS(jsonResult.p);
        fluxServerComments.dispatchUpdate(path, patchUpdate);
      } catch (err) {
        if (__DEV__) {
          throw err;
        } else {
          console.error(err);
        }
      }
    }
  });
  if (__DEV__) {
    console.log('comments flux listen sso flux on: ', config.sso['flux-www'].url);
  }
};

exports['default'] = { runFluxServer: runFluxServer };
module.exports = exports['default'];