'use strict'

/**
 * Dependencies
 * @ignore
 */
const _ = require('lodash')

/**
 * Collection
 * @class
 * A collection of values with some additional logic in the form
 * of the ```.filter()``` method. Used as a generic for
 * {@link PluginCollection} and {@link DependencyCollection}
 * 
 * @param {collection} collection Base collection
 *
 * @extends Array
 */
class Collection extends Array {

  /**
   * Constructor
   *
   * @description
   * Initialize a new collection.
   */
  constructor (collection) {
    super()
    
    _.values(collection).forEach(item => {
      this.push(item)
    })
  }

  /**
   * Filter
   *
   * @description
   * Filter the current collection and return a new collection
   * (of the same type) containing items matching the predicate.
   * 
   * @param {object | function} predicate Lodash-style predicate
   * 
   * @returns {Collection}
   */
  filter (predicate) {
    return new this.constructor(_.filter(this, predicate))
  }

}

/**
 * Exports
 */
module.exports = Collection
