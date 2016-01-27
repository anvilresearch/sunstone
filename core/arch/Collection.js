'use strict'

/**
 * Dependencies
 */
const _ = require('lodash')

/**
 * Collection
 */
class Collection extends Array {

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
    return new this.constructor(_.filter(this, predicate))
  }

}

/**
 * Exports
 */
module.exports = Collection
