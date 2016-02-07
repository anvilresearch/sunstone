'use strict'

/**
 * Dependencies
 * @ignore
 */
const injector = require('./injectorInstance')
const Registry = require('./Registry')

/**
 * Host
 *
 * @class
 * This is the main class of the program. The constructor initializes an
 * injector and registry for the application. The bootstrap method uses the
 * registry to find, load, validate and initialize plugins. The run method
 * starts the application.
 *
 * **Examples**
 *
 * *Host Application*
 *
 * ```js
 * module.exports = require('sunstone').configure({
 *   directories: [
 *     path.join(__dirname, 'plugins'),
 *     path.join(process.cwd(), 'plugins')
 *   ],
 *   node_modules: [
 *     'sunstone-server',
 *     'sunstone-logger'
 *   ]
 * })
 * ```
 *
 * *Extending Application*
 *
 * ```js
 * require('my-app').bootstrap({
 *   directories: [
 *     other
 *   ]
 * }).run()
 * ```
 *
 * This class requires the modules {@link Registry}.
 *
 * @todo decide how to handle directory/node_modules configuration
 * @todo needs to handle customized plugin directories
 */
class Host {

  /**
   * Constructor
   * @description
   * Initialize a Host.
   *
   * @param {object} options options object
   * @requires Registry
   */
  constructor (options) {
    let registry = new Registry(options)

    this.options = options
    this.registry = registry
  }

  /**
   * Bootstrap
   *
   * @description
   * Create a new Host instance with the provided options and initialize the
   * application.
   *
   * @param {object} options options object
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
   *
   * @description
   * Run starts the application by injecting the main dependency, then iterating
   * through all the plugins and starting each of them.
   */
  run () {
    injector.get('main')
    this.registry
      // @todo .filter({ enabled: true })
      .filter()
      .start()
  }

}

/**
 * Exports
 */
module.exports = Host
