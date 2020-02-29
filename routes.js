'use strict';
const home = require('./routes/home');
const { proposals, likeProject } = require('./routes/dao');

module.exports = function (app) {
  app.get('/', home);
  app.get('/proposals/:userAddress', proposals);
  app.get('/proposals', proposals);
  app.post('/likeProject', likeProject);
};
