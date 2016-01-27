'use strict'

/**
 * Dependencies
 */
const _ = require('lodash')
const Collection = require('./Collection')
const injector = require('./injector')

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
 *    var DependencyCollection = require('./DependencyCollection')
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
 *    dc.filter({ type: 'factory' }).values()
 *
 */
class DependencyCollection extends Collection {

  /**
   * Values
   */
  values () {
    return this.map(descriptor => injector.get(descriptor.name))
  }
}

/**
 * Exports
 */
module.exports = DependencyCollection
