'use strict'

module.exports = function (sunstone) {

  /**
   * Plugin
   */
  sunstone.plugin('Server', {
    version: '0.0.1',
    dependencies: {
      'Data': '>=0.0.1'
    },
    // IDEA:
    //providedInterfaces: {}
    //requiredInterfaces: {}
  })
  .initializer(function (plugin) {
    plugin.alias('main', 'server')
    // this could be plugin.main('server') instead??

    /**
     * Includes
     */
    .include(__dirname, './redis')
    .include(__dirname, './router')
    .include(__dirname, './session')
    .include(__dirname, './server')
    .include(__dirname, './settings')

    /**
     * Custom dependency type
     */
    .assembler('router', function (injector) {
      let plugin = this
      return function (name, fn) {
        injector.register({
          name,
          type: 'router',
          plugin: this.name,
          fn
        })

        return this
      }
    })

    /**
     * Module dependencies
     */
    .require({
      'bodyParser': 'body-parser',
      'connectFlash': 'connect-flash',
      'consolidate': 'consolidate',
      'cookieParser': 'cookie-parser',
      'cors': 'cors',
      'express': 'express',
    })

    /**
     * Start callback
     */
    .starter(function (server, settings) {
      let port = settings.port
      server.listen(port, function () {
        console.log(`Listening on ${port}`)
      })
    })

  })
}

