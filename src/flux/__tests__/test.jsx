require('babel/register')({
  only: /\.jsx$/,
  modules: 'common',
  optional: [
    'es7.classProperties',
    'es7.decorators',
    'es7.objectRestSpread',
    'runtime',
  ],
});

var serverFluxComments = require('./comments/server');
