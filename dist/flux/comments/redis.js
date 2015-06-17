'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

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

var RedisDescriptor = (function () {
  function RedisDescriptor(config, fluxActions) {
    _classCallCheck(this, RedisDescriptor);

    this.actionRedis = 'action_' + config.channel;
    this.updateRedis = 'update_' + config.channel;
    this.publisher = _redis2['default'].createClient(config.port, config.host);
    this.subscriber = _redis2['default'].createClient(config.port, config.host);
    this.fluxActions = fluxActions;
  }

  _createClass(RedisDescriptor, [{
    key: 'initSubscribe',
    value: function initSubscribe(flux) {
      var _this = this;

      // manage redis subscription
      this.subscriber.subscribe(this.updateRedis);
      this.subscriber.on('message', function (channel, message) {
        if (message !== '' && channel === _this.updateRedis) {
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
            flux.dispatchUpdate(path, patchUpdate);
          } catch (err) {
            if (__DEV__) {
              throw err;
            } else {
              console.error(err);
            }
          }
        }
      });
    }
  }, {
    key: 'initPublish',
    value: function initPublish(flux) {
      var _this2 = this;

      flux.on('action', function (_ref) {
        var path = _ref.path;
        var params = _ref.params;

        if (_this2.fluxActions[path] !== void 0) {
          _this2.publisher.publish(_this2.actionRedis, _this2.fluxActions[path](params));
        }
      });
    }
  }]);

  return RedisDescriptor;
})();

exports['default'] = RedisDescriptor;
module.exports = exports['default'];