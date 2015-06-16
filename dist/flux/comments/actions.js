'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _sha1 = require('sha1');

var _sha12 = _interopRequireDefault(_sha1);

var _xsBlowfish = require('xs-blowfish');

var _xsBlowfish2 = _interopRequireDefault(_xsBlowfish);

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

var getUserId = function getUserId(token, tokenValid) {
  var bf = new _xsBlowfish2['default'](token);
  return parseInt(bf.decrypt(tokenValid.user_id_crypted), 10);
};

// manage actions
var createActions = function createActions(redisClientPublisher, actionRedis, tokens) {
  return {
    // defines postComment action
    '/comments/comment/post': function commentsCommentPost(_ref) {
      var threadId = _ref.threadId;
      var parentId = _ref.parentId;
      var comment = _ref.comment;
      var token = _ref.token;

      var tokenValid = tokens.value.get((0, _sha12['default'])(token));
      if (tokenValid !== void 0) {
        var userId = getUserId(token, tokenValid);
        var createComment = {
          action: 'commentsCommentPost',
          query: {
            threadId: threadId,
            parentId: parentId,
            userId: userId,
            comment: comment
          }
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(createComment));
      }
    },
    // defines editComment action
    '/comments/comment/edit': function commentsCommentEdit(_ref2) {
      var commentId = _ref2.commentId;
      var edit = _ref2.edit;
      var token = _ref2.token;

      var tokenValid = tokens.value.get((0, _sha12['default'])(token));
      if (tokenValid !== void 0) {
        var userId = getUserId(token, tokenValid);
        var editComment = {
          action: 'commentsCommentEdit',
          query: {
            commentId: commentId,
            userId: userId,
            edit: edit
          }
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(editComment));
      }
    },
    // defines deleteComment action
    '/comments/comment/delete': function commentsCommentDelete(_ref3) {
      var commentId = _ref3.commentId;
      var token = _ref3.token;

      var tokenValid = tokens.value.get((0, _sha12['default'])(token));
      if (tokenValid !== void 0) {
        var userId = getUserId(token, tokenValid);
        var deleteComment = {
          action: 'commentsCommentDelete',
          query: {
            commentId: commentId,
            userId: userId
          }
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(deleteComment));
      }
    },
    // defines shareComment action
    '/comments/comment/share': function commentsCommentShare(_ref4) {
      var commentId = _ref4.commentId;
      var support = _ref4.support;
      var token = _ref4.token;

      var tokenValid = tokens.value.get((0, _sha12['default'])(token));
      if (tokenValid !== void 0) {
        var userId = getUserId(token, tokenValid);
        var shareComment = {
          action: 'commentsCommentShare',
          query: {
            commentId: commentId,
            userId: userId,
            support: support
          }
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(shareComment));
      }
    },
    // defines createUser action
    '/comments/user/create': function commentsUserCreate(_ref5) {
      var userId = _ref5.userId;
      var nickname = _ref5.nickname;
      var avatar = _ref5.avatar;

      var createUser = {
        action: 'commentsUserCreate',
        query: {
          userId: userId,
          nickname: nickname,
          avatar: avatar
        }
      };
      // publish on redis
      redisClientPublisher.publish(actionRedis, JSON.stringify(createUser));
    },
    // defines addVote action
    '/comments/comment/addVote': function commentsCommentAddVote(_ref6) {
      var commentId = _ref6.commentId;
      var isPositive = _ref6.isPositive;
      var token = _ref6.token;

      var tokenValid = tokens.value.get((0, _sha12['default'])(token));
      if (tokenValid !== void 0) {
        var userId = getUserId(token, tokenValid);
        var createVote = {
          action: 'commentsCommentAddVote',
          query: {
            commentId: commentId,
            userId: userId,
            isPositive: isPositive
          }
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(createVote));
      }
    },
    // defines removeVote action
    '/comments/comment/removeVote': function commentsCommentRemoveVote(_ref7) {
      var commentId = _ref7.commentId;
      var token = _ref7.token;

      var tokenValid = tokens.value.get((0, _sha12['default'])(token));
      if (tokenValid !== void 0) {
        var userId = getUserId(token, tokenValid);
        var removeVote = {
          action: 'commentsCommentRemoveVote',
          query: {
            commentId: commentId,
            userId: userId
          }
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(removeVote));
      }
    },
    // defines report comment action
    '/comments/comment/addReport': function commentsCommentAddReport(_ref8) {
      var commentId = _ref8.commentId;
      var token = _ref8.token;

      var tokenValid = tokens.value.get((0, _sha12['default'])(token));
      if (tokenValid !== void 0) {
        var userId = getUserId(token, tokenValid);
        var addReport = {
          action: 'commentsCommentAddReport',
          query: {
            commentId: commentId,
            userId: userId
          }
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(addReport));
      }
    },
    // defines updateSEO action
    '/comments/thread/updateSeo': function commentsThreadUpdateSeo(_ref9) {
      var threadId = _ref9.threadId;
      var seo = _ref9.seo;
      var token = _ref9.token;

      var tokenValid = tokens.value.get((0, _sha12['default'])(token));
      if (tokenValid !== void 0) {
        var userId = getUserId(token, tokenValid);
        var updateSEO = {
          action: 'commentsThreadUpdateSeo',
          query: {
            userId: userId,
            threadId: threadId,
            seo: parseInt(seo, 10)
          }
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(updateSEO));
      }
    }
  };
};

exports['default'] = { createActions: createActions };
module.exports = exports['default'];