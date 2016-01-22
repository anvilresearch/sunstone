'use strict'

/**
 * Native Dependencies
 */
var path = require('path')

/**
 * External Dependencies
 */
var glob = require('glob')
var _ = require('lodash')
var semver = require('semver')

/**
 * Local Dependencies
 */
var Plugin = require('./Plugin')
var PluginContainer = require('./PluginContainer')
var PluginContainerCollection = require('./PluginContainerCollection')
var Injector = require('./Injector')

/**
 * Symbols
 */
const plugins = Symbol()
const injector = Symbol()
const containedPlugins = Symbol()

/**
 * PluginManager
 */
class PluginManager {

  /**
   * Constructor
   */
  constructor () {
    this[injector] = new Injector()
    this[plugins] = {}
    this[containedPlugins] = new PluginContainerCollection()
  }

  /**
   * Plugin
   *
   * Construct and return a plugin if a manifest argument is provided,
   * otherwise, return the previously registered plugin.
   *
   * TODO
   * - should "getting" a plugin throw an error if a plugin isn't found?
   */
  plugin (name, manifest) {
    if (manifest) {
      let pluginContainer = new PluginContainer(name, manifest, this[injector])
      this[containedPlugins].register(pluginContainer)
      return pluginContainer
    } else {
      return this[plugins][name]
    }
  }
  
  /**
   * Require
   */
  require () {
    let segments = Array.prototype.slice.call(arguments, this.require.length)
    let directory = path.join.apply(null, segments)
    let pattern = path.join(directory, '**/index.js')
    let plugins = glob.sync(path.resolve(pattern))

    plugins.forEach((plugin) => {
      require(plugin)(this)
    })
  }


  /**
   * Lifecycle
   *
   * A set of methods here should match method names on the Plugin class.
   * Each method should take a predicate, query the plugins (PluginColection?)
   * and invoke the function with the same name on each plugin matching the
   * predicate
   */

  add () {} // alias .plugin(name, manifest)
  start (predicate) {}
  stop (predicate) {}
  remove (predicate) {}


  /**
   * Bootstrap
   *
   * TODO
   * This should be responsible to load the plugins from various directories using
   * require, validate the plugins, initialize the "main" dependency, query the plugins
   * and call "starter" methods on each.
   */
  bootstrap () {
    let cwd = process.cwd()

    // load plugins from source code
    this.require(__dirname, 'plugins')

    // load plugins from node_modules
    // ???

    // load plugins from project
    if (cwd !== __dirname) {
      this.require(cwd, 'plugins')
    }

    this[containedPlugins].resolve()
    this[containedPlugins].prioritize()

    this[containedPlugins].prioritized.forEach(dependencyName => {
      let containedPlugin = this[containedPlugins].plugins[dependencyName]
      this[plugins][dependencyName] = containedPlugin.load()
    })

    // assemble the server and create a reference
    this.server = this[injector].get('server')
    this.settings = this[injector].get('settings')

    // register routes
    // TODO
    // - this belongs in a "starter" method defined by a plugin
    //
    this[injector]
      .filter({
        type: 'router'
      })
      .values()
      .forEach((router) => {
        router.mount()
      })

    // validate plugin dependencies
    this.validate()
  }

  /**
   * Validate Plugins
   *
   * TODO
   *  - how should this behave if we're doing hot swapping?
   *    It's possible there needs to be some kind of error
   *    handling besides throw.
   */
  validate () {
    // iterate through the registered plugins
    Object.keys(this[plugins]).forEach((pluginName) => {
      let plugin = this[plugins][pluginName]
      let dependencies = plugin.manifest.dependencies || {}

      // iterate through the plugin's dependencies
      Object.keys(dependencies).forEach((dependencyName) => {
        let dependency = this[plugins][dependencyName]

        // catch missing dependency
        if (!dependency) {
          throw new Error(
            `Plugin ${pluginName} has a ` +
            `missing dependency ${dependencyName}`
          )
        }

        // catch incompatible version
        let version = dependency.manifest.version
        let range = dependencies[dependencyName]

        if (!semver.satisfies(version, range)) {
          throw new Error(
            `Plugin ${pluginName} requires ${dependencyName} ` +
            `version ${dependencies[dependencyName]}`
          )
        }
      })
    })
  }

  /**
   * Start
   */
  static run () {
    let manager = new PluginManager()
    manager.bootstrap()

    let host = manager.settings.host
    let port = manager.settings.port

    manager.server.listen(port, function () {
      console.log(`Listening on ${port}`)
    })
  }

}

/**
 * Exports
 */
module.exports = PluginManager

