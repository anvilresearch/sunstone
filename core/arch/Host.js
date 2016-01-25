'use strict'

/**
 * Dependencies
 */
const Injector = require('./Injector')
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
    let injector = new Injector()
    let registry = new Registry(options)

    this.options = options
    this.injector = injector
    this.registry = registry
  }

  /**
   * Bootstrap
   */
  static bootstrap (options) {
    let host = Host(options)

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
    this.injector.get('main')
    this.registry
      .filter({ enabled: true })
      .start()
  }

}

/**
 * Exports
 */
module.exports = Host
