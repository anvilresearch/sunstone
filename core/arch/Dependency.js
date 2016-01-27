'use strict'

/**
 * Dependencies
 */
const Model = require('../data/Model')

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

  /**
   * Extract Dependencies
   * Adapted from AngularJS.
   */
  static extractDependencies (fn) {
    let str = fn.toString().replace(STRIP_COMMENTS, '')
    let match = str.match(ARROW_ARG) || str.match(FN_ARGS)
    let args = match[1].split(FN_ARG_SPLIT)
    let result = args.map(str => str.trim())
    return result[0] !== '' ? result : []
  }

  /**
   * extractDependencies
   */
  extractDependencies () {
    // TODO
    // consider a generalized name for the function on a dependency
    // and see if we can eliminate this kind of overly specific code
    let lookup = {
      'factory': 'factory',
      'alias': 'factory',
      'adapter': 'factory',
      'module': 'factory',
      'router': 'factory',
      'extension': 'mutator',
      'callback': 'callback',
    }

    let fn = this[lookup[this.type]]
    if (fn  && !this.dependencies) {
      this.dependencies = Dependency.extractDependencies(fn)
    }
  }

  /**
   * get schema
   */
  static get schema () {
    /**
     * factoryConform
     */
    const factoryErrorMessage = 'A factory, mutator, callback or value is required'
    function factoryConform (value, instance) {
      // check for a value on the dependency
      if (instance.value) {
        return true
      }

      // if there is no value present there needs to be a factory, callback or mutator
      // and any of those need to be a function
      let present = instance.factory || instance.callback || instance.mutator
      return present
        ? typeof present === 'function'
        || instance.value
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

    /**
     * Dependency schema
     */
    return {
      name: { type: 'string', required: true },
      type: { type: 'string', required: true },
      plugin: { type: 'string', required: true },
      factory: factoryConformProperty,
      mutator: factoryConformProperty,
      callback: factoryConformProperty,
      value: factoryConformProperty,
      dependencies: { type: 'array' }
    }
  }

}

/**
 * Exports
 */
module.exports = Dependency
