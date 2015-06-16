import sha1 from 'sha1';
import Blowfish from 'xs-blowfish';

const getUserId = (token, tokenValid) => {
  const bf = new Blowfish(token);
  return parseInt(bf.decrypt(tokenValid.user_id_crypted), 10);
};

// manage actions
const createActions = (redisClientPublisher, actionRedis, tokens) => {
  return {
    // defines postComment action
    '/comments/comment/post': ({ threadId, parentId, comment, token }) => {
      const tokenValid = tokens.value.get(sha1(token));
      if(tokenValid !== void 0) {
        const userId = getUserId(token, tokenValid);
        const createComment = {
          action: 'commentsCommentPost',
          query: {
            threadId,
            parentId,
            userId,
            comment,
          },
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(createComment));
      }
    },
    // defines editComment action
    '/comments/comment/edit': ({ commentId, edit, token }) => {
      const tokenValid = tokens.value.get(sha1(token));
      if(tokenValid !== void 0) {
        const userId = getUserId(token, tokenValid);
        const editComment = {
          action: 'commentsCommentEdit',
          query: {
            commentId,
            userId,
            edit,
          },
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(editComment));
      }
    },
    // defines deleteComment action
    '/comments/comment/delete': ({ commentId, token }) => {
      const tokenValid = tokens.value.get(sha1(token));
      if(tokenValid !== void 0) {
        const userId = getUserId(token, tokenValid);
        const deleteComment = {
          action: 'commentsCommentDelete',
          query: {
            commentId,
            userId,
          },
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(deleteComment));
      }
    },
    // defines shareComment action
    '/comments/comment/share': ({ commentId, support, token }) => {
      const tokenValid = tokens.value.get(sha1(token));
      if(tokenValid !== void 0) {
        const userId = getUserId(token, tokenValid);
        const shareComment = {
          action: 'commentsCommentShare',
          query: {
            commentId,
            userId,
            support,
          },
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(shareComment));
      }
    },
    // defines createUser action
    '/comments/user/create': ({ userId, nickname, avatar }) => {
      const createUser = {
        action: 'commentsUserCreate',
        query: {
          userId,
          nickname,
          avatar,
        },
      };
      // publish on redis
      redisClientPublisher.publish(actionRedis, JSON.stringify(createUser));
    },
    // defines addVote action
    '/comments/comment/addVote': ({ commentId, isPositive, token }) => {
      const tokenValid = tokens.value.get(sha1(token));
      if(tokenValid !== void 0) {
        const userId = getUserId(token, tokenValid);
        const createVote = {
          action: 'commentsCommentAddVote',
          query: {
            commentId,
            userId,
            isPositive,
          },
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(createVote));
      }
    },
    // defines removeVote action
    '/comments/comment/removeVote': ({ commentId, token }) => {
      const tokenValid = tokens.value.get(sha1(token));
      if(tokenValid !== void 0) {
        const userId = getUserId(token, tokenValid);
        const removeVote = {
          action: 'commentsCommentRemoveVote',
          query: {
            commentId,
            userId,
          },
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(removeVote));
      }
    },
    // defines report comment action
    '/comments/comment/addReport': ({ commentId, token }) => {
      const tokenValid = tokens.value.get(sha1(token));
      if(tokenValid !== void 0) {
        const userId = getUserId(token, tokenValid);
        const addReport = {
          action: 'commentsCommentAddReport',
          query: {
            commentId,
            userId,
          },
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(addReport));
      }
    },
    // defines updateSEO action
    '/comments/thread/updateSeo': ({ threadId, seo, token }) => {
      const tokenValid = tokens.value.get(sha1(token));
      if(tokenValid !== void 0) {
        const userId = getUserId(token, tokenValid);
        const updateSEO = {
          action: 'commentsThreadUpdateSeo',
          query: {
            userId,
            threadId,
            seo: parseInt(seo, 10),
          },
        };
        // publish on redis
        redisClientPublisher.publish(actionRedis, JSON.stringify(updateSEO));
      }
    },
  };
};

export default { createActions };
