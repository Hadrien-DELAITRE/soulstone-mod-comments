'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var _nexusFluxSocketIoClient = require('nexus-flux-socket.io/client');

var _nexusFluxSocketIoClient2 = _interopRequireDefault(_nexusFluxSocketIoClient);

var _sha1 = require('sha1');

var _sha12 = _interopRequireDefault(_sha1);

var _xsBlowfish = require('xs-blowfish');

var _xsBlowfish2 = _interopRequireDefault(_xsBlowfish);

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

var ActionDescriptor = (function () {
  function ActionDescriptor(config) {
    _classCallCheck(this, ActionDescriptor);

    var fluxClientSSO = new _nexusFluxSocketIoClient2['default'](config.url);
    var tokensLifespan = new _nexusFlux.Lifespan();
    this.tokens = fluxClientSSO.getStore('/sso/validTokensHashes', tokensLifespan).onUpdate(function () {
      return void 0;
    }).onDelete(function () {
      return void 0;
    });
  }

  _createClass(ActionDescriptor, [{
    key: 'getUserId',
    value: function getUserId(token, tokenValid) {
      var bf = new _xsBlowfish2['default'](token);
      return parseInt(bf.decrypt(tokenValid.user_id_crypted), 10);
    }
  }, {
    key: 'getActions',
    value: function getActions() {
      var _this = this;

      return {
        // defines postComment action
        '/comments/comment/post': function commentsCommentPost(_ref) {
          var threadId = _ref.threadId;
          var parentId = _ref.parentId;
          var comment = _ref.comment;
          var token = _ref.token;

          var tokenValid = _this.tokens.value.get((0, _sha12['default'])(token));
          if (tokenValid !== void 0) {
            var userId = _this.getUserId(token, tokenValid);
            var createComment = {
              action: 'commentsCommentPost',
              query: {
                threadId: threadId,
                parentId: parentId,
                userId: userId,
                comment: comment
              }
            };
            return JSON.stringify(createComment);
          }
        },
        // defines editComment action
        '/comments/comment/edit': function commentsCommentEdit(_ref2) {
          var commentId = _ref2.commentId;
          var edit = _ref2.edit;
          var token = _ref2.token;

          var tokenValid = _this.tokens.value.get((0, _sha12['default'])(token));
          if (tokenValid !== void 0) {
            var userId = _this.getUserId(token, tokenValid);
            var editComment = {
              action: 'commentsCommentEdit',
              query: {
                commentId: commentId,
                userId: userId,
                edit: edit
              }
            };
            return JSON.stringify(editComment);
          }
        },
        // defines deleteComment action
        '/comments/comment/delete': function commentsCommentDelete(_ref3) {
          var commentId = _ref3.commentId;
          var token = _ref3.token;

          var tokenValid = _this.tokens.value.get((0, _sha12['default'])(token));
          if (tokenValid !== void 0) {
            var userId = _this.getUserId(token, tokenValid);
            var deleteComment = {
              action: 'commentsCommentDelete',
              query: {
                commentId: commentId,
                userId: userId
              }
            };
            return JSON.stringify(deleteComment);
          }
        },
        // defines shareComment action
        '/comments/comment/share': function commentsCommentShare(_ref4) {
          var commentId = _ref4.commentId;
          var support = _ref4.support;
          var token = _ref4.token;

          var tokenValid = _this.tokens.value.get((0, _sha12['default'])(token));
          if (tokenValid !== void 0) {
            var userId = _this.getUserId(token, tokenValid);
            var shareComment = {
              action: 'commentsCommentShare',
              query: {
                commentId: commentId,
                userId: userId,
                support: support
              }
            };
            return JSON.stringify(shareComment);
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
          return JSON.stringify(createUser);
        },
        // defines addVote action
        '/comments/comment/addVote': function commentsCommentAddVote(_ref6) {
          var commentId = _ref6.commentId;
          var isPositive = _ref6.isPositive;
          var token = _ref6.token;

          var tokenValid = _this.tokens.value.get((0, _sha12['default'])(token));
          if (tokenValid !== void 0) {
            var userId = _this.getUserId(token, tokenValid);
            var createVote = {
              action: 'commentsCommentAddVote',
              query: {
                commentId: commentId,
                userId: userId,
                isPositive: isPositive
              }
            };
            return JSON.stringify(createVote);
          }
        },
        // defines removeVote action
        '/comments/comment/removeVote': function commentsCommentRemoveVote(_ref7) {
          var commentId = _ref7.commentId;
          var token = _ref7.token;

          var tokenValid = _this.tokens.value.get((0, _sha12['default'])(token));
          if (tokenValid !== void 0) {
            var userId = _this.getUserId(token, tokenValid);
            var removeVote = {
              action: 'commentsCommentRemoveVote',
              query: {
                commentId: commentId,
                userId: userId
              }
            };
            return JSON.stringify(removeVote);
          }
        },
        // defines report comment action
        '/comments/comment/addReport': function commentsCommentAddReport(_ref8) {
          var commentId = _ref8.commentId;
          var token = _ref8.token;

          var tokenValid = _this.tokens.value.get((0, _sha12['default'])(token));
          if (tokenValid !== void 0) {
            var userId = _this.getUserId(token, tokenValid);
            var addReport = {
              action: 'commentsCommentAddReport',
              query: {
                commentId: commentId,
                userId: userId
              }
            };
            return JSON.stringify(addReport);
          }
        },
        // defines updateSEO action
        '/comments/thread/updateSeo': function commentsThreadUpdateSeo(_ref9) {
          var threadId = _ref9.threadId;
          var seo = _ref9.seo;
          var token = _ref9.token;

          var tokenValid = _this.tokens.value.get((0, _sha12['default'])(token));
          if (tokenValid !== void 0) {
            var userId = _this.getUserId(token, tokenValid);
            var updateSEO = {
              action: 'commentsThreadUpdateSeo',
              query: {
                userId: userId,
                threadId: threadId,
                seo: parseInt(seo, 10)
              }
            };
            return JSON.stringify(updateSEO);
          }
        }
      };
    }
  }]);

  return ActionDescriptor;
})();

exports['default'] = ActionDescriptor;
module.exports = exports['default'];