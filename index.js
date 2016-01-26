'use strict'

var server = require('./core/arch/Host').bootstrap()

if (!module.parent) {
  server.run()
} else {
  module.exports = server
}
