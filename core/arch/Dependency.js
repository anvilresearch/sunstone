'use strict'

/**
 * Dependencies
 */
const Model = require('../data/Model')

/**
 * List dependencies by stringifying and parsing the factory function.
 * Borrowed from AngularJS. Does the licensing allow this?
 */

/**
 * Constants
 */
const ARROW_ARG = /^([^\(]+?)=>/
const FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m
const FN_ARG_SPLIT = /,/
const FN_ARG = /^\s*(_?)(\S+?)\1\s*$/
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg


/**
 * Dependency
 */
class Dependency extends Model {

  constructor (descriptor) {
    if (descriptor) {
      Object.keys(descriptor).forEach(key => {
        this[key] = descriptor[key]
      }) 
    }
  }

  /**
   * Extract Dependencies
   * Adapted from AngularJS.
   */
  static extractDependencies (fn) {
    let str = fn.toString().replace(STRIP_COMMENTS, '')
    let match = str.match(ARROW_ARG) || str.match(FN_ARGS)
    let args = match[1].split(FN_ARG_SPLIT)
    return args.map(str => str.trim())
  }

  extractDependencies () {
    if (this.factory && !descriptor.dependencies) {
      this.dependencies = Dependency.extractDependencies(this.factory)
    }
  }

  static get schema () {
    /**
     * factoryConform
     */
    const factoryErrorMessage = 'A factory, mutator, callback or value is required'
    function factoryConform (value, instance) {
      // check for a value on the dependency
      if (this.value) {
        return true
      }

      // if there is no value present there needs to be a factory, callback or mutator
      // and any of those need to be a function
      let present = this.factory || this.callback || this.mutator
      return present 
        ? typeof present === 'function' 
        || this.value 
        : false
    }

    // seeing as the property would be the same for all factory types and value;
    // create a single instance of the property for use over all four.
    let factoryConformProperty = { 
      type: 'any', 
      conform: factoryConform, 
      messages: {
        conform: factoryErrorMessage
      }
    }

    return {
      name: { type: 'string', required: true },
      type: { type: 'string', required: true },
      plugin: { type: 'string', required: true },
      factory: factoryConformProperty,
      mutator: factoryConformProperty,
      callback: factoryConformProperty,
      value: factoryConformProperty
    }
  }

}

module.exports = Dependency