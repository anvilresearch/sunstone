'use strict'

/**
 * Dependencies
 */
var _ = require('lodash')

/**
 * Symbols
 */
let injector = Symbol()

/**
 * Plugin
 *
 * TODO
 *  By itself this is not a plugin system. It's a way of
 *  grouping dependency definitions under a namespace with
 *  metadata (the manifest).
 *
 *  To make a plugin system, we need a way to dynamically
 *  load, reload, unload, instantiate, tear down, enable,
 *  disable, etc, while the application is running.
 *
 *  This capability is where the various
 *  `injector.register` functions may begin to
 *  differentiate themselves further.
 */
class Plugin {

  /**
   * Constructor
   */
  constructor (name, manifest, _injector) {
    this.name = name
    this.manifest = manifest
    this[injector] = _injector
  }

  /**
   * Require
   */
  require (modules) {
    if (Array.isArray(modules)) {
      modules = _.zipObject(modules, modules)
    }

    Object.keys(modules).forEach((key) => {
      this.factory(key, function () {
        return require(modules[key])
      })
    })

    return this
  }

  /**
   * Factory
   */
  factory (name, factory) {
    this[injector].register({
      name,
      type: 'factory',
      plugin: this.name,
      factory
    })

    return this
  }

  /**
   * Alias
   *
   * Create factories that determin which implementation
   * to use at injection time.
   *
   * Example:
   *
   *   sunstone.plugin(<NAME>, <MANIFEST>)
   *     .factory('a', function () {})
   *     .factory('b', function () {})
   *     .alias('c', function (injector, settings) {
   *        // where settings.property is 'a' or 'b'
   *        return injector.get(settings.property)
   *     })
   *     .factory('d', function (c) {})
   *
   *
   * TODO:
   *  - is "alias" the right name for this?
   *  - is there any way enforce that it's used this way?
   *  - is it even necessary or desirable to have this
   *    vs just using factory?
   */
  alias (name, factory) {
    this[injector].register({
      name,
      type: 'alias',
      plugin: this.name,
      factory
    })

    return this
  }

  /**
   * Extension
   */
  extension (name, mutator) {
    this[injector].register({
      name,
      type: 'extension',
      plugin: this.name,
      mutator
    })

    return this
  }

  /**
   * Router
   */
  router (name, factory) {
    this[injector].register({
      name,
      type: 'router',
      plugin: this.name,
      mutator
    })

    return this
  }

  /**
   * Connector
   */
  connector (name, factory) {
    this[injector].register({
      name,
      type: 'connector',
      plugin: this.name,
      mutator
    })

    return this
  }

  /**
   * Lifecycle Management
   */

  /**
   * Start
   */
  start () {}

  /**
   * Stop
   */
  stop () {}

}

/**
 * Exports
 */
module.exports = Plugin
