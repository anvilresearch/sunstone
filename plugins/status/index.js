'use strict'

module.exports = function (sunstone) {

  sunstone.plugin('Status', {
    version: '0.0.1',
    dependencies: {
      'Server': '>=0.0.1'
    }
  })
  .initialize(function (plugin) {
    plugin

    /**
     * Status
     */
    .router('status', function (Router) {
      let router = Router()

      router.get('/', function (req, res, next) {
        res.json({ status: 'OK' })
      })

      return router
    })
  })  
}
