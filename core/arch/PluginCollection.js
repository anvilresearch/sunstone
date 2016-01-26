'use strict'

/**
 * Dependencies
 */
const _ = require('lodash')

/**
 * PluginCollection
 */
class PluginCollection extends Array {

  /**
   * Constructor
   */
  constructor (collection) {
    super()
    _.values(collection).forEach(item => {
      this.push(item)
    })
  }

  /**
   * Filter
   */
  filter (predicate) {
    return new PluginCollection(_.filter(this, predicate))
  }

  /**
   * Start
   */
  start () {
    this.forEach(plugin => plugin.start())
  }

}

/**
 * Exports
 */
module.exports = PluginCollection
