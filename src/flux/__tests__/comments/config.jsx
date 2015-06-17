import millenium from 'millenium-shared';
import secrets from '../../../../node_modules/millenium-shared/dist/internal-secrets';
import _ from 'lodash';

const mode = process.env.MILLENIUM_MODE || 'local';
const https = mode === 'beta' || mode === 'prod';
const logger = _.includes(['combined', 'common', 'dev', 'short', 'tiny'], process.env.LOGGER) ?
  process.env.LOGGER :
  false;

export default {
  macros: {
    '__VERSION__': 'v0_0_5',
    '__ACTION__': 'utils_fetch_',
    '__ACTION_EDITS__': 'utils_fetch_edits_',
    '__ACTION_VOTES__': 'utils_fetch_votes_',
    '__ACTION_REPORTS__': 'utils_fetch_reports_',
    '__ACTION_V7V8THREADS__': 'utils_fetch_v7_v8_threads_',
    '__FETCH_PAGE__': 'utils_fetch_comments_page_',
    '__FETCH_REPLIES__': 'utils_fetch_comments_replies_',
  },

  redis: {
    channel: 'comments',
  },

  comments: {
    flux: {
      port: millenium.apps['millenium-comments'].http.flux.ports[0],
    },
    'flux-mq': {
      host: millenium.apps['millenium-comments'].services['flux-mq'].host(mode),
      port: millenium.apps['millenium-comments'].services['flux-mq'].port,
    },
    'flux-sql': {
      host: millenium.apps['millenium-comments'].services['flux-sql'].host(mode),
      local: millenium.apps['millenium-comments'].services['flux-sql'].local,
      type: millenium.apps['millenium-comments'].services['flux-sql'].type,
      secret: secrets.postgres.millenium_comments,
      poolSize: 100,
    },
  },

  sso: {
    'flux-www': {
      url: https ? millenium.apps['millenium-sso'].http['flux-www'].url(mode) :
        millenium.apps['millenium-sso'].http.flux.url(mode),
    },
  },

  logger,
};
