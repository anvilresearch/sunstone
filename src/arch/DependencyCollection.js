'use strict'

/**
 * Dependencies
 * @ignore
 */
const _ = require('lodash')
const Collection = require('./Collection')

/**
 * Dependency Collection
 * 
 * @class
 * Results container for results of querying injector dependencies.
 *
 * ```js
 * 'use strict'
 *
 * var Injector = require('./injector')
 * var DependencyCollection = require('./DependencyCollection')
 *
 * var injector = new Injector()
 * var a = { name: 'a', plugin: 'MyPlugin', type: 'factory', factory: () => 'a' }
 * var b = { name: 'b', plugin: 'MyPlugin', type: 'factory', factory: () => 'b' }
 * var c = { name: 'c', plugin: 'MyPlugin', type: 'other', factory: () => 'c' }
 *
 * injector.register(a)
 * injector.register(b)
 * injector.register(c)
 *
 * var dc = new DependencyCollection({a,b,c})
 * dc.filter({ type: 'factory' }).values()
 * ```
 * @extends Collection
 * @param {collection} collection Base collection
 */
class DependencyCollection extends Collection {

  /**
   * Values
   * 
   * @description
   * Iterate through current contents of the collection and return the
   * relative instances from the injector.
   * 
   * @returns {Array}
   */
  values () {
    let injector = require('./injectorInstance')
    return this.map(dependency => injector.get(dependency.name))
  }
}

/**
 * Exports
 */
module.exports = DependencyCollection
