'use strict'
const simple = require('./routes/simple')
const configured = require('./routes/configured')

module.exports = function (app, opts) {
  // Setup routes, middleware, and handlers
  app.get('/', simple)
  app.get('/configured', configured(opts))
}
