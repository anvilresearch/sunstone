'use strict'

/**
 * Local Dependencies
 */
var Plugin = require('./Plugin')

/**
 * Symbols
 */
const injector = Symbol()

/**
 * PluginContainer
 */
class PluginContainer {

  constructor (name, manifest, _injector) {
    this.name = name
    this.manifest = manifest
    this[injector] = _injector
  }

  initialize (factory) {
    this.factory = factory
  }

  load () {
    if (!this.factory) {
      throw new Error(`Plugin ${this.name} does not have an initializer callback`)
    }
    
    let plugin = new Plugin(this.name, this.manifest, this[injector])
    this.factory(plugin)
    return plugin
  }
}

/**
 * Exports
 */
module.exports = PluginContainer
