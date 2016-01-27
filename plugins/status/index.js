'use strict'

module.exports = function (sunstone) {

  sunstone.plugin('Status', {
    version: '0.0.1',
    dependencies: {
      'Server': '>=0.0.1'
    }
  })

  /**
   * Plugin initializer
   */
  .initializer(function (plugin) {

    /**
     * Status
     */
    plugin.router('status', function (Router) {
      let router = Router()

      router.get('/', function (req, res, next) {
        res.json({ status: 'OK' })
      })

      return router
    })

    /**
     * Start callback
     */
    plugin.starter(function (injector, server) {
      injector.filter({
        plugin: 'Status',
        type: 'router'
      })
      .values()
      .forEach(router => {
        server.use(router)
      })
    })
  })
}
