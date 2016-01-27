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
 * Example:
 *
 *    // host application
 *    module.exports = require('sunstone').bootstrap({})
 *
 *    // extending application
 *    require('my-app').run()
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
