'use strict'

/**
 * Dependencies
 */
const _ = require('lodash')
const Collection = require('./Collection')

/**
 * PluginCollection
 */
class PluginCollection extends Collection {

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
