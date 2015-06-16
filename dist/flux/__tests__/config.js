'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _milleniumShared = require('millenium-shared');

var _milleniumShared2 = _interopRequireDefault(_milleniumShared);

var _node_modulesMilleniumSharedDistInternalSecrets = require('../../../node_modules/millenium-shared/dist/internal-secrets');

var _node_modulesMilleniumSharedDistInternalSecrets2 = _interopRequireDefault(_node_modulesMilleniumSharedDistInternalSecrets);

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

var mode = process.env.MILLENIUM_MODE || 'local';
var https = mode === 'beta' || mode === 'prod';
var logger = _.includes(['combined', 'common', 'dev', 'short', 'tiny'], process.env.LOGGER) ? process.env.LOGGER : false;

exports['default'] = {
  macros: {
    '__VERSION__': 'v0_0_5',
    '__ACTION__': 'utils_fetch_',
    '__ACTION_EDITS__': 'utils_fetch_edits_',
    '__ACTION_VOTES__': 'utils_fetch_votes_',
    '__ACTION_REPORTS__': 'utils_fetch_reports_',
    '__ACTION_V7V8THREADS__': 'utils_fetch_v7_v8_threads_',
    '__FETCH_PAGE__': 'utils_fetch_comments_page_',
    '__FETCH_REPLIES__': 'utils_fetch_comments_replies_'
  },

  redis: {
    channel: 'comments'
  },

  comments: {
    flux: {
      port: _milleniumShared2['default'].apps['millenium-comments'].http.flux.ports[0]
    },
    'flux-mq': {
      host: _milleniumShared2['default'].apps['millenium-comments'].services['flux-mq'].host(mode),
      port: _milleniumShared2['default'].apps['millenium-comments'].services['flux-mq'].port
    },
    'flux-sql': {
      host: _milleniumShared2['default'].apps['millenium-comments'].services['flux-sql'].host(mode),
      local: _milleniumShared2['default'].apps['millenium-comments'].services['flux-sql'].local,
      type: _milleniumShared2['default'].apps['millenium-comments'].services['flux-sql'].type,
      secret: _node_modulesMilleniumSharedDistInternalSecrets2['default'].postgres.millenium_comments,
      poolSize: 100
    }
  },

  sso: {
    'flux-www': {
      url: https ? _milleniumShared2['default'].apps['millenium-sso'].http['flux-www'].url(mode) : _milleniumShared2['default'].apps['millenium-sso'].http.flux.url(mode)
    }
  },

  logger: logger
};
module.exports = exports['default'];