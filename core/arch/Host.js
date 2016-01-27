'use strict'

/**
 * Dependencies
 */
const injector = require('./injector')
const Registry = require('./Registry')

/**
 * Host
 *
 * This is the main class of the program. The constructor initializes an
 * injector and registry for the application. The bootstrap method uses the
 * registry to find, load, validate and initialize plugins. The run method
 * starts the application.
 * 
 * TODO
 *   - decide how to handle directory/node_modules configuration
 *   - needs to handle customized plugin directories
 * 
 * Example:
 *
 *    // host application
 *    module.exports = require('sunstone').configure({
 *      directories: [
 *        path.join(__dirname, 'plugins'),
 *        path.join(process.cwd(), 'plugins')
 *      ],
 *      node_modules: [
 *        'sunstone-server',
 *        'sunstone-logger'
 *      ]
 *    })
 *
 *    // extending application
 *    require('my-app').bootstrap({
 *      directories: [
 *        other
 *      ]
 *    }).run()
 */
class Host {

  /**
   * Constructor
   */
  constructor (options) {
    let registry = new Registry(options)

    this.options = options
    this.registry = registry
  }

  /**
   * Bootstrap
   */
  static bootstrap (options) {
    let host = new Host(options)

    host.registry
      .glob()
      .require()
      .resolve()
      .prioritize()
      .initialize()

    return host
  }

  /**
   * Run
   */
  run () {
    injector.get('main')
    this.registry
      // TODO
      //.filter({ enabled: true })
      .filter()
      .start()
  }

}

/**
 * Exports
 */
module.exports = Host
