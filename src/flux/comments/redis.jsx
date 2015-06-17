import redis from 'redis';
import { Remutable } from 'nexus-flux';
const __DEV__ = (process.env.NODE_ENV === 'development');

class RedisDescriptor {
  constructor(config, fluxActions) {
    this.actionRedis = `action_${config.channel}`;
    this.updateRedis = `update_${config.channel}`;
    this.publisher = redis.createClient(config.port, config.host);
    this.subscriber = redis.createClient(config.port, config.host);
    this.fluxActions = fluxActions;
  }

  initSubscribe(flux) {
    // manage redis subscription
    this.subscriber.subscribe(this.updateRedis);
    this.subscriber.on('message', (channel, message) => {
      if(message !== '' && channel === this.updateRedis) {
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
          flux.dispatchUpdate(path, patchUpdate);
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
  }

  initPublish(flux) {
    flux.on('action', ({ path, params }) => {
      if(this.fluxActions[path] !== void 0) {
        this.publisher.publish(this.actionRedis, this.fluxActions[path](params));
      }
    });
  }
}

export default RedisDescriptor;
