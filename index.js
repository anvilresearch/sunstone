'use strict'

var server = require('./core/arch/sunstone')

if (!module.parent) {
  server.start()
} else {
  module.exports = server
}
