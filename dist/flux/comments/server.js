'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _nexusFluxSocketIoServer = require('nexus-flux-socket.io/server');

var _nexusFluxSocketIoServer2 = _interopRequireDefault(_nexusFluxSocketIoServer);

var _nexusFlux = require('nexus-flux');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _pgQuery = require('pg-query');

var _pgQuery2 = _interopRequireDefault(_pgQuery);

var _pgFormat = require('pg-format');

var _pgFormat2 = _interopRequireDefault(_pgFormat);

var _isomorphicRouter = require('isomorphic-router');

var _isomorphicRouter2 = _interopRequireDefault(_isomorphicRouter);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

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

// configures Pool Size about database connections
var fluxSQL = _config2['default'].comments['flux-sql'];
_pg2['default'].defaults.poolSize = fluxSQL.poolSize;
_pgQuery2['default'].connectionParameters = '' + fluxSQL.type + '://' + fluxSQL.local + ':' + fluxSQL.secret + '@' + fluxSQL.host + '/' + fluxSQL.local;
_pgQuery2['default'].pg = _pg2['default'];

/**
* Creates the millenium-comment-flux SocketIOServer
* Will allow to query the postgresql database in order to fetch specific from requested path
* Will allow to notify all react components when subscribed data has been updated
* @class SocketIOServerImpl
* @extends SocketIOServer
*/

var SocketIOServerImpl = (function (_SocketIOServer) {

  /**
  * Initializes stored procedure versioning, remutables, routes and clock
  * @constructor
  * @param {number} port The listening port
  */

  function SocketIOServerImpl(port) {
    var _this = this;

    _classCallCheck(this, SocketIOServerImpl);

    var expressUse = _config2['default'].logger ? [(0, _morgan2['default'])(_config2['default'].logger)] : [];
    _get(Object.getPrototypeOf(SocketIOServerImpl.prototype), 'constructor', this).call(this, port, void 0, void 0, void 0, expressUse);

    // init versioning
    this.actionPostgresql = '' + _config2['default'].macros.__ACTION__ + '' + _config2['default'].macros.__VERSION__;
    this.actionEditsPostgresql = '' + _config2['default'].macros.__ACTION_EDITS__ + '' + _config2['default'].macros.__VERSION__;
    this.actionVotesPostgresql = '' + _config2['default'].macros.__ACTION_VOTES__ + '' + _config2['default'].macros.__VERSION__;
    this.actionReportsPostgresql = '' + _config2['default'].macros.__ACTION_REPORTS__ + '' + _config2['default'].macros.__VERSION__;
    this.actionV7V8ThreadsPostgresql = '' + _config2['default'].macros.__ACTION_V7V8THREADS__ + '' + _config2['default'].macros.__VERSION__;
    this.fetchCommentsPage = '' + _config2['default'].macros.__FETCH_PAGE__ + '' + _config2['default'].macros.__VERSION__;
    this.fetchCommentsReplies = '' + _config2['default'].macros.__FETCH_REPLIES__ + '' + _config2['default'].macros.__VERSION__;

    // init empty json query
    this.jsonQuery = {};

    // init remutable for the internal server clock
    this.clock = new _nexusFlux.Remutable({
      date: Date.now()
    });

    if (__DEV__) {
      console.log('comments flux on port: ', port);
    }

    // configure routes
    this.router = new _isomorphicRouter2['default']().on('/comments/threads/:threadId', function (_ref) {
      var threadId = _ref.threadId;

      var path = '/comments/threads/' + threadId;
      var params = {};
      var columnKeys = {};
      params.thread_id = parseInt(threadId, 10);
      columnKeys.thread_id = 'thread_id';
      return _this.buildQuery('threads', columnKeys, params, path);
    }).on('/comments/threads', function () {
      var path = '/comments/threads';
      var params = {};
      var columnKeys = {};
      columnKeys.thread_id = 'thread_id';
      return _this.buildQuery('threads', columnKeys, params, path);
    }).on('/comments/threads/:threadId/comments', function (_ref2) {
      var threadId = _ref2.threadId;

      var path = '/comments/threads/' + threadId + '/comments';
      var params = {};
      var columnKeys = {};
      params.thread_id = parseInt(threadId, 10);
      columnKeys.comment_id = 'comment_id';
      return _this.buildQuery('comments', columnKeys, params, path);
    }).on('/comments/comment/:commentId/replies', function (_ref3) {
      var commentId = _ref3.commentId;

      var path = '/comments/comment/' + commentId + '/replies';
      var params = [parseInt(commentId, 10)];
      return _this.queryFetch(path, params, _this.fetchCommentsReplies);
    }).on('/comments/threads/:threadId/comments/:pageId', function (_ref4) {
      var threadId = _ref4.threadId;
      var pageId = _ref4.pageId;

      var path = '/comments/threads/' + threadId + '/comments/' + pageId;
      var params = [parseInt(threadId, 10), parseInt(pageId, 10)];
      return _this.queryFetch(path, params, _this.fetchCommentsPage);
    }).on('/comments/threads/:threadId/edits', function (_ref5) {
      var threadId = _ref5.threadId;

      var path = '/comments/threads/' + threadId + '/edits';
      var params = [parseInt(threadId, 10)];
      return _this.queryFetch(path, params, _this.actionEditsPostgresql);
    }).on('/comments/threads/:threadId/votes', function (_ref6) {
      var threadId = _ref6.threadId;

      var path = '/comments/threads/' + threadId + '/votes';
      var params = [parseInt(threadId, 10)];
      return _this.queryFetch(path, params, _this.actionVotesPostgresql);
    }).on('/comments/threads/:threadId/reports', function (_ref7) {
      var threadId = _ref7.threadId;

      var path = '/comments/threads/' + threadId + '/reports';
      var params = [parseInt(threadId, 10)];
      return _this.queryFetch(path, params, _this.actionReportsPostgresql);
    }).on('/comments/v7v8Threads/:v7ThreadId', function (_ref8) {
      var v7ThreadId = _ref8.v7ThreadId;

      var path = '/comments/v7v8Threads/' + v7ThreadId;
      var params = [parseInt(v7ThreadId, 10)];
      return _this.queryFetch(path, params, _this.actionV7V8ThreadsPostgresql);
    }).on('/comments/users/:userId', function (_ref9) {
      var userId = _ref9.userId;

      var path = '/comments/users/' + userId;
      var params = {};
      var columnKeys = {};
      params.user_id = parseInt(userId, 10);
      columnKeys.user_id = 'user_id';
      return _this.buildQuery('users', columnKeys, params, path);
    }).on('/comments/clock', function () {
      return _this.clock.toJSON();
    });

    // start clock
    this.lifespan.setInterval(function () {
      _this.dispatchUpdate('/comments/clock', _this.clock.set('date', Date.now()).commit());
    }, 30000);
  }

  _inherits(SocketIOServerImpl, _SocketIOServer);

  _createClass(SocketIOServerImpl, [{
    key: 'serveStore',

    /**
    * Method called when a client sends a "GET" request
    * @function serveStore
    * @param {String} path The requested PATH
    * @return {Object} remutable The remutable built according to the requested PATH
    */
    value: function serveStore(_ref10) {
      var _this2 = this;

      var path = _ref10.path;
      var originalUrl = _ref10.originalUrl;

      return Promise['try'](function () {
        if (__DEV__) {
          path.should.be.a.String;
          console.log(originalUrl);
        }
        return _this2.router.route(path)[0];
      });
    }
  }, {
    key: 'queryFetch',
    value: function queryFetch(path, params, action) {
      var buildParams = [null];
      buildParams.push(action);
      buildParams.push(path);
      var formatParams = params.map(function () {
        return '%L';
      }).join(',');
      var queryString = params.length > 0 ? 'SELECT %s(%L, ' + formatParams + ')' : 'SELECT %s(%L)';
      var queryFormat = _pgFormat2['default'].withArray(queryString, buildParams.concat(params));
      // get connection pool and request postgresql database
      return (0, _pgQuery2['default'])(queryFormat).spread(function (results) {
        // build remutable from results
        var jsonResult = results[0][action];
        var version = parseInt(jsonResult.v, 10) || 0;
        var hash = parseInt(jsonResult.h, 10);
        var data = jsonResult.d;
        var remutable = new _nexusFlux.Remutable(data, version, hash).toJSON();
        return remutable;
      });
    }
  }, {
    key: 'buildQuery',

    /**
    * Method to build postgresql query from given params
    * Return a specific remutable from the built query
    * @function buildQuery
    * @param {String} table The database table to query
    * @param {String} columnKeys The column name that matches the primary key
    * @param {Array} params Values that will be associated with a "WHERE" clause
    * @param {String} path The requested PATH
    * @return {Object} remutable The remutable built from the result of the database
    */
    value: function buildQuery(table, columnKeys, params, path) {
      var _this3 = this;

      // build query from params
      this.jsonQuery.table = table.toLowerCase();
      this.jsonQuery.columnKeys = columnKeys;
      this.jsonQuery.params = params;
      var action = this.actionPostgresql;

      var buildParams = [null];
      buildParams.push(action);
      buildParams.push(path);
      buildParams.push(this.jsonQuery);
      var queryFormat = _pgFormat2['default'].withArray('SELECT %s(%L, %L)', buildParams);

      // get connection pool and request postgresql database
      return (0, _pgQuery2['default'])(queryFormat).spread(function (results) {
        // build remutable from results
        var jsonResult = results[0][_this3.actionPostgresql];
        var version = parseInt(jsonResult.v, 10) || 0;
        var hash = parseInt(jsonResult.h, 10);
        var data = jsonResult.d;
        var remutable = new _nexusFlux.Remutable(data, version, hash).toJSON();
        return remutable;
      });
    }
  }]);

  return SocketIOServerImpl;
})(_nexusFluxSocketIoServer2['default']);

exports['default'] = SocketIOServerImpl;
module.exports = exports['default'];