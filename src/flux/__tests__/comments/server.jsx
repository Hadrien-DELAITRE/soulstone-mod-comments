import FluxCommentsSocketIOServer from '../../comments/server';
import config from './config';

const configFlux = {
  port: config.comments.flux.port,
  postgresql: {
    macros: config.macros,
    sql: config.comments['flux-sql'],
  },
  logger: config.logger,
  sso: {
    url: config.sso['flux-www'].url,
  },
  redis: {
    host: config.comments['flux-mq'].host,
    port: config.comments['flux-mq'].port,
    channel: config.redis.channel,
  },
};

const fluxCommentsSocketIOServer = new FluxCommentsSocketIOServer(configFlux);

export default fluxCommentsSocketIOServer;
