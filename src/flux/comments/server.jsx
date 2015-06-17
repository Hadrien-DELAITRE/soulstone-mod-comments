import SocketIOServer from 'nexus-flux-socket.io/server';
import ActionDescriptor from './actions';
import RedisDescriptor from './redis';
import { Remutable } from 'nexus-flux';
import pg from 'pg';
import query from 'pg-query';
import pgFormat from 'pg-format';
import Router from 'isomorphic-router';
import morgan from 'morgan';
import Promise from 'bluebird';
const __DEV__ = (process.env.NODE_ENV === 'development');


/**
* Creates the millenium-comment-flux SocketIOServer
* Will allow to query the postgresql database in order to fetch specific from requested path
* Will allow to notify all react components when subscribed data has been updated
* @class SocketIOServerImpl
* @extends SocketIOServer
*/
class SocketIOServerImpl extends SocketIOServer {

  /**
  * Initializes stored procedure versioning, remutables, routes and clock
  * @constructor
  * @param {number} port The listening port
  */
  constructor({ port, postgresql, logger, sso, redis }) {
    const expressUse = logger ? [morgan(logger)] : [];
    super(port, void 0, void 0, void 0, expressUse);

    // init versioning
    this.initPostgresql(postgresql);

    const actionDescriptor = new ActionDescriptor(sso);
    const redisDescriptor = new RedisDescriptor(redis, actionDescriptor.getActions());
    redisDescriptor.initSubscribe(this);
    redisDescriptor.initPublish(this);

    // init empty json query
    this.jsonQuery = {};

    // init remutable for the internal server clock
    this.clock = new Remutable({
      date: Date.now(),
    });

    if(__DEV__) {
      console.log('comments flux on port: ', port);
    }

    // configure routes
    this.router = new Router()

    .on('/comments/threads/:threadId', ({ threadId }) => {
      const path = `/comments/threads/${threadId}`;
      const params = {};
      const columnKeys = {};
      params.thread_id = parseInt(threadId, 10);
      columnKeys.thread_id = 'thread_id';
      return this.buildQuery('threads', columnKeys, params, path);
    })

    .on('/comments/threads', () => {
      const path = `/comments/threads`;
      const params = {};
      const columnKeys = {};
      columnKeys.thread_id = 'thread_id';
      return this.buildQuery('threads', columnKeys, params, path);
    })

    .on('/comments/threads/:threadId/comments', ({ threadId }) => {
      const path = `/comments/threads/${threadId}/comments`;
      const params = {};
      const columnKeys = {};
      params.thread_id = parseInt(threadId, 10);
      columnKeys.comment_id = 'comment_id';
      return this.buildQuery('comments', columnKeys, params, path);
    })

    .on('/comments/comment/:commentId/replies', ({ commentId }) => {
      const path = `/comments/comment/${commentId}/replies`;
      const params = [parseInt(commentId, 10)];
      return this.queryFetch(path, params, this.fetchCommentsReplies);
    })

    .on('/comments/threads/:threadId/comments/:pageId', ({ threadId, pageId }) => {
      const path = `/comments/threads/${threadId}/comments/${pageId}`;
      const params = [parseInt(threadId, 10), parseInt(pageId, 10)];
      return this.queryFetch(path, params, this.fetchCommentsPage);
    })

    .on('/comments/threads/:threadId/edits', ({ threadId }) => {
      const path = `/comments/threads/${threadId}/edits`;
      const params = [parseInt(threadId, 10)];
      return this.queryFetch(path, params, this.actionEditsPostgresql);
    })

    .on('/comments/threads/:threadId/votes', ({ threadId }) => {
      const path = `/comments/threads/${threadId}/votes`;
      const params = [parseInt(threadId, 10)];
      return this.queryFetch(path, params, this.actionVotesPostgresql);
    })

    .on('/comments/threads/:threadId/reports', ({ threadId }) => {
      const path = `/comments/threads/${threadId}/reports`;
      const params = [parseInt(threadId, 10)];
      return this.queryFetch(path, params, this.actionReportsPostgresql);
    })

    .on('/comments/v7v8Threads/:v7ThreadId', ({ v7ThreadId }) => {
      const path = `/comments/v7v8Threads/${v7ThreadId}`;
      const params = [parseInt(v7ThreadId, 10)];
      return this.queryFetch(path, params, this.actionV7V8ThreadsPostgresql);
    })

    .on('/comments/users/:userId', ({ userId }) => {
      const path = `/comments/users/${userId}`;
      const params = {};
      const columnKeys = {};
      params.user_id = parseInt(userId, 10);
      columnKeys.user_id = 'user_id';
      return this.buildQuery('users', columnKeys, params, path);
    })

    .on('/comments/clock', () => {
      return this.clock.toJSON();
    });

    // start clock
    this.lifespan.setInterval(() => {
      this.dispatchUpdate('/comments/clock', this.clock.set('date', Date.now()).commit());
    }, 30000);
  }

  initPostgresql(config) {
    // configures postgresql database
    const fluxSQL = config.sql;
    pg.defaults.poolSize = fluxSQL.poolSize;
    query.connectionParameters = `${fluxSQL.type}://${fluxSQL.local}:${fluxSQL.secret}@${fluxSQL.host}/${fluxSQL.local}`;
    query.pg = pg;

    this.actionPostgresql = `${config.macros.__ACTION__}${config.macros.__VERSION__}`;
    this.actionEditsPostgresql = `${config.macros.__ACTION_EDITS__}${config.macros.__VERSION__}`;
    this.actionVotesPostgresql = `${config.macros.__ACTION_VOTES__}${config.macros.__VERSION__}`;
    this.actionReportsPostgresql = `${config.macros.__ACTION_REPORTS__}${config.macros.__VERSION__}`;
    this.actionV7V8ThreadsPostgresql = `${config.macros.__ACTION_V7V8THREADS__}${config.macros.__VERSION__}`;
    this.fetchCommentsPage = `${config.macros.__FETCH_PAGE__}${config.macros.__VERSION__}`;
    this.fetchCommentsReplies = `${config.macros.__FETCH_REPLIES__}${config.macros.__VERSION__}`;
  }

  /**
  * Method called when a client sends a "GET" request
  * @function serveStore
  * @param {String} path The requested PATH
  * @return {Object} remutable The remutable built according to the requested PATH
  */
  serveStore({ path, originalUrl }) {
    return Promise.try(() => {
      if(__DEV__) {
        path.should.be.a.String;
        console.log(originalUrl);
      }
      return this.router.route(path)[0];
    });
  }

  queryFetch(path, params, action) {
    const buildParams = [null];
    buildParams.push(action);
    buildParams.push(path);
    const formatParams = params.map(() => {
      return '%L';
    }).join(',');
    const queryString = params.length > 0 ? `SELECT %s(%L, ${formatParams})` : `SELECT %s(%L)`;
    const queryFormat = pgFormat.withArray(queryString, buildParams.concat(params));
    // get connection pool and request postgresql database
    return query(queryFormat).spread((results) => {
      // build remutable from results
      const jsonResult = results[0][action];
      const version = parseInt(jsonResult.v, 10) || 0;
      const hash = parseInt(jsonResult.h, 10);
      const data = jsonResult.d;
      const remutable = new Remutable(data, version, hash).toJSON();
      return remutable;
    });
  }

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
  buildQuery(table, columnKeys, params, path) {
    // build query from params
    this.jsonQuery.table = table.toLowerCase();
    this.jsonQuery.columnKeys = columnKeys;
    this.jsonQuery.params = params;
    const action = this.actionPostgresql;

    const buildParams = [null];
    buildParams.push(action);
    buildParams.push(path);
    buildParams.push(this.jsonQuery);
    const queryFormat = pgFormat.withArray(`SELECT %s(%L, %L)`, buildParams);

    // get connection pool and request postgresql database
    return query(queryFormat).spread((results) => {
      // build remutable from results
      const jsonResult = results[0][this.actionPostgresql];
      const version = parseInt(jsonResult.v, 10) || 0;
      const hash = parseInt(jsonResult.h, 10);
      const data = jsonResult.d;
      const remutable = new Remutable(data, version, hash).toJSON();
      return remutable;
    });
  }
}

export default SocketIOServerImpl;
