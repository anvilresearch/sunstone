'use strict'

var server = require('./core/arch/sunstone')

if (!module.parent) {
  server.run()
} else {
  module.exports = server
}
