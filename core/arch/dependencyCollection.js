'use strict'

/**
 * Dependencies
 */
var _ = require('lodash')

/**
 * Symbols
 */
const injector = Symbol()

/**
 * Dependency Collection
 *
 * Results container for results of querying injector dependencies. Extends `Array`
 * to include additional methods.
 *
 * Example:
 *
 *    'use strict'
 *
 *    var Injector = require('./injector')
 *    var DependencyCollection = require('./dependencyCollection')
 *
 *    var injector = new Injector()
 *    var a = { name: 'a', type: 'factory', factory: () => 'a' }
 *    var b = { name: 'b', type: 'factory', factory: () => 'b' }
 *    var c = { name: 'c', type: 'other', factory: () => 'c' }
 *
 *    injector.register(a)
 *    injector.register(b)
 *    injector.register(c)
 *
 *    var dc = new DependencyCollection({a,b,c}, injector)
 *    dc.find({ type: 'factory' }).values()
 *
 */
class DependencyCollection extends Array {

  /**
   * Constructor
   */
  constructor (collection, _injector) {
    super()
    this[injector] = _injector

    _.values(collection).forEach(item => {
      this.push(item)
    })
  }

  /**
   * Find
   */
  find (predicate) {
    return new DependencyCollection(_.filter(this, predicate), this[injector])
  }

  /**
   * Values
   */
  values () {
    return this.map(descriptor => this[injector].get(descriptor.name))
  }
}

/**
 * Exports
 */
module.exports = DependencyCollection
