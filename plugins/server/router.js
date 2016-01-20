'use strict'

module.exports = function (plugin) {

  /**
   * Router
   */
  plugin.factory('Router', function (express, server) {
    let Router = express.Router

    Router.mount = function () {
      server.use(this)
    }

    Router.unmount = function () {
      let stack = server._router.stack
      let index = stack.indexOf(this)
      stack.splice(index, 1)
    }

    return Router
  })
}
