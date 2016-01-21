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
  .initialize(function (plugin) {
    plugin
    
    /**
     * Includes
     */
    .include(__dirname, './redis')
    .include(__dirname, './router')
    .include(__dirname, './session')
    .include(__dirname, './settings')

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
     * settings
     */
    .factory('settings', function (Settings, path) {
      return Settings.read(path.join(process.cwd(), 'settings.json'))
    })

    /**
     * server
     */
    .factory('server', function (
      bodyParser,
      connectFlash,
      consolidate,
      cookieParser,
      cors,
      express,
      session,
      settings
    ) {

      /**
       * Server
       */
      let server = express()

      /**
       * Disable default header
       */
      server.disable('x-powered-by')

      /**
       * Views configuration
       * TODO
       */

      /**
       * Request parsing
       */
      server.use(cookieParser(settings.cookie_secret))
      server.use(bodyParser.urlencoded({ extended: false }))
      server.use(bodyParser.json())

      /**
       * Express Session
       */
      server.use(session)

      /**
       * Flash messaging
       */

      server.use(connectFlash())

      /**
       * Cross-Origin Support
       */

      server.use(cors())

      /**
       * Ready
       */
      return server
    })
  })
}

