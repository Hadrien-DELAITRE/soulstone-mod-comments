import SocketIOFluxServerComments from './server';
import { createActions } from './actions';
import SocketIOFluxClientSSO from 'nexus-flux-socket.io/client';

import redis from 'redis';
import { Remutable, Lifespan } from 'nexus-flux';

const runFluxServer = (config) => {
  const fluxServerComments = new SocketIOFluxServerComments(config.comments.flux.port);
  const fluxClientSSO = new SocketIOFluxClientSSO(config.sso['flux-www'].url);

  const fluxCommentsMQ = config.comments['flux-mq'];
  const redisClientPublisher = redis.createClient(fluxCommentsMQ.port, fluxCommentsMQ.host);
  const redisClientSubscriber = redis.createClient(fluxCommentsMQ.port, fluxCommentsMQ.host);
  const actionRedis = `action_${config.redis.channel}`;
  const updateRedis = `update_${config.redis.channel}`;

  const tokensLifespan = new Lifespan();
  const tokens = fluxClientSSO.getStore('/sso/validTokensHashes', tokensLifespan)
    .onUpdate(() => (void 0)).onDelete(() => (void 0));

  const serverActions = createActions(redisClientPublisher, actionRedis, tokens);

  fluxServerComments.on('action', ({ path, params }) => {
    if(serverActions[path] !== void 0) {
      serverActions[path](params);
    }
  });

  // manage redis subscription
  redisClientSubscriber.subscribe(updateRedis);
  redisClientSubscriber.on('message', (channel, message) => {
    if(message !== '' && channel === updateRedis) {
      const jsonResult = JSON.parse(message);
      if(__DEV__) {
        console.log('message', message);
        console.log('channel', channel);
      }
      try {
        jsonResult.should.have.property('n');
        jsonResult.should.have.property('p');
        const path = jsonResult.n;
        const patchUpdate = Remutable.Patch.fromJS(jsonResult.p);
        fluxServerComments.dispatchUpdate(path, patchUpdate);
      }
      catch(err) {
        if(__DEV__) {
          throw err;
        }
        else {
          console.error(err);
        }
      }
    }
  });
  if(__DEV__) {
    console.log('comments flux listen sso flux on: ', config.sso['flux-www'].url);
  }
};

export default { runFluxServer };
