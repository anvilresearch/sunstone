'use strict'

/**
 * Native Dependencies
 */
var path = require('path')

/**
 * External Dependencies
 */
var glob = require('glob')

/**
 * Local Dependencies
 */
var Plugin = require('./plugin')
var Injector = require('./injector')

/**
 * Symbols
 */
const plugins = Symbol()
const injector = Symbol()

/**
 * Sunstone
 */
class Sunstone {

  /**
   * Constructor
   */
  constructor () {
    this[injector] = new Injector()
    this[plugins] = {}
  }

  /**
   * Plugin
   */
  plugin (name, manifest) {
    if (manifest) {
      let plugin = new Plugin(name, manifest, this[injector])
      this[plugins][name] = plugin
      return plugin
    } else {
      return this[plugins][name]
    }
  }

  /**
   * Require
   */
  require() {
    let segments = Array.prototype.slice.call(arguments, this.require.length)
    let directory = path.join.apply(null, segments)
    let pattern = path.join(directory, '**/*.js')
    let plugins = glob.sync(path.resolve(pattern))

    plugins.forEach((plugin) => {
      require(plugin)(this)
    })
  }

  /**
   * Bootstrap
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

    // assemble the server and create a reference
    this.server = this[injector].get('server')
    this.settings = this[injector].get('settings')

    // register routes
    this[injector].find({
      type: 'router'
    }).forEach((router) => {
      router.mount()
    })
  }

  /**
   * Start
   */
  static start () {
    let sunstone = new Sunstone()
    sunstone.bootstrap()

    let host = sunstone.settings.host
    let port = sunstone.settings.port

    sunstone.server.listen(port, function () {
      console.log(`Listening on ${port}`)
    })
  }

}

/**
 * Exports
 */
module.exports = Sunstone

