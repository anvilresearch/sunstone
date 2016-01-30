'use strict'

/**
 * Dependencies
 * @ignore
 */
const _ = require('lodash')
const Collection = require('./Collection')

/**
 * PluginCollection
 * 
 * @class
 * Results container for results of querying plugins from the registry.
 *
 * @param {collection} collection Base collection
 *
 * @extends Collection
 * 
 */
class PluginCollection extends Collection {

  /**
   * Start
   * 
   * @description
   * Iterate over plugins in the collection and call ```plugin.start()```
   * on each.
   */
  start () {
    this.forEach(plugin => plugin.start())
  }

}

/**
 * Exports
 */
module.exports = PluginCollection
