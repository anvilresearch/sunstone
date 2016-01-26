'use strict'

module.exports = function (plugin) {

  plugin.factory('server', function (
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
}

