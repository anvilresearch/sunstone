'use strict'

const injector = Symbol()

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
    if (!this.factory) throw
    return this.factory(new Plugin(this.name, this.manifest))
  }
}