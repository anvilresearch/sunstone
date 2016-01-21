'use strict'

var server = require('./core/arch/PluginManager')

if (!module.parent) {
  server.run()
} else {
  module.exports = server
}
