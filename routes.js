'use strict';
const home = require('./routes/home');
const { proposals } = require('./routes/dao');

module.exports = function (app) {
  app.get('/', home);
  app.get('/proposals', proposals);
};
