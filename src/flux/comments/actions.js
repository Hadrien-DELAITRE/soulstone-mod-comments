import SocketIOFluxClientSSO from 'nexus-flux-socket.io/client';
import sha1 from 'sha1';
import Blowfish from 'xs-blowfish';
import { Lifespan } from 'nexus-flux';

class ActionDescriptor {
  constructor(config) {
    const fluxClientSSO = new SocketIOFluxClientSSO(config.url);
    const tokensLifespan = new Lifespan();
    this.tokens = fluxClientSSO.getStore('/sso/validTokensHashes', tokensLifespan)
      .onUpdate(() => (void 0)).onDelete(() => (void 0));
  }

  getUserId(token, tokenValid) {
    const bf = new Blowfish(token);
    return parseInt(bf.decrypt(tokenValid.user_id_crypted), 10);
  }

  getActions() {
    return {
      // defines postComment action
      '/comments/comment/post': ({ threadId, parentId, comment, token }) => {
        const tokenValid = this.tokens.value.get(sha1(token));
        if(tokenValid !== void 0) {
          const userId = this.getUserId(token, tokenValid);
          const createComment = {
            action: 'commentsCommentPost',
            query: {
              threadId,
              parentId,
              userId,
              comment,
            },
          };
          return JSON.stringify(createComment);
        }
      },
      // defines editComment action
      '/comments/comment/edit': ({ commentId, edit, token }) => {
        const tokenValid = this.tokens.value.get(sha1(token));
        if(tokenValid !== void 0) {
          const userId = this.getUserId(token, tokenValid);
          const editComment = {
            action: 'commentsCommentEdit',
            query: {
              commentId,
              userId,
              edit,
            },
          };
          return JSON.stringify(editComment);
        }
      },
      // defines deleteComment action
      '/comments/comment/delete': ({ commentId, token }) => {
        const tokenValid = this.tokens.value.get(sha1(token));
        if(tokenValid !== void 0) {
          const userId = this.getUserId(token, tokenValid);
          const deleteComment = {
            action: 'commentsCommentDelete',
            query: {
              commentId,
              userId,
            },
          };
          return JSON.stringify(deleteComment);
        }
      },
      // defines shareComment action
      '/comments/comment/share': ({ commentId, support, token }) => {
        const tokenValid = this.tokens.value.get(sha1(token));
        if(tokenValid !== void 0) {
          const userId = this.getUserId(token, tokenValid);
          const shareComment = {
            action: 'commentsCommentShare',
            query: {
              commentId,
              userId,
              support,
            },
          };
          return JSON.stringify(shareComment);
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
        return JSON.stringify(createUser);
      },
      // defines addVote action
      '/comments/comment/addVote': ({ commentId, isPositive, token }) => {
        const tokenValid = this.tokens.value.get(sha1(token));
        if(tokenValid !== void 0) {
          const userId = this.getUserId(token, tokenValid);
          const createVote = {
            action: 'commentsCommentAddVote',
            query: {
              commentId,
              userId,
              isPositive,
            },
          };
          return JSON.stringify(createVote);
        }
      },
      // defines removeVote action
      '/comments/comment/removeVote': ({ commentId, token }) => {
        const tokenValid = this.tokens.value.get(sha1(token));
        if(tokenValid !== void 0) {
          const userId = this.getUserId(token, tokenValid);
          const removeVote = {
            action: 'commentsCommentRemoveVote',
            query: {
              commentId,
              userId,
            },
          };
          return JSON.stringify(removeVote);
        }
      },
      // defines report comment action
      '/comments/comment/addReport': ({ commentId, token }) => {
        const tokenValid = this.tokens.value.get(sha1(token));
        if(tokenValid !== void 0) {
          const userId = this.getUserId(token, tokenValid);
          const addReport = {
            action: 'commentsCommentAddReport',
            query: {
              commentId,
              userId,
            },
          };
          return JSON.stringify(addReport);
        }
      },
      // defines updateSEO action
      '/comments/thread/updateSeo': ({ threadId, seo, token }) => {
        const tokenValid = this.tokens.value.get(sha1(token));
        if(tokenValid !== void 0) {
          const userId = this.getUserId(token, tokenValid);
          const updateSEO = {
            action: 'commentsThreadUpdateSeo',
            query: {
              userId,
              threadId,
              seo: parseInt(seo, 10),
            },
          };
          return JSON.stringify(updateSEO);
        }
      },
    };
  }
}

export default ActionDescriptor;
