'use strict'

/**
 * Dependencies
 * @ignore
 */
const Model = require('../data/Model')

/**
 * Constants
 * @ignore
 */
const ARROW_ARG = /^([^\(]+?)=>/
const FN_ARGS = /^[^\(]*\(\s*([^\)]*)\)/m
const FN_ARG_SPLIT = /,/
const FN_ARG = /^\s*(_?)(\S+?)\1\s*$/
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg

/**
 * Dependency
 *
 * @class
 * Instances of Dependency are self-validating containers for
 * dependencies registered on the injector.
 *
 * @param {object} descriptor Dependency descriptor
 *
 * @extends Model
 */
class Dependency extends Model {

  /**
   * Extract Dependencies
   * Adapted from AngularJS.
   * @private
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
   *
   * @description
   * Parse dependencies and store them as an array of dependency
   * names on this instance.
   * 
   */
  extractDependencies () {
    if (this.fn && !this.dependencies) {
      this.dependencies = Dependency.extractDependencies(this.fn)
    }
  }

  /**
   * get schema
   * @private
   */
  static get schema () {

    /**
     * conform
     * 
     * validation function for factory function and value on schema
     */
    function conform (value, instance) {
      // if there is a value present then dependency is valid
      if (instance.value) {
        return true
      }

      // check if there is a function present on the dependency
      return instance.fn
        ? typeof instance.fn === 'function'
        : false
    }

    // a standardised conformer property for factory function (fn)
    // and value on schema
    let conformer = { 
      type: 'any',
      conform,
      messages: {
        conform: 'function or value is required'
      }
    }

    /**
     * Dependency schema
     */
    return {
      name: { type: 'string', required: true },
      type: { type: 'string', required: true },
      plugin: { type: 'string', required: true },
      fn: conformer,
      value: conformer,
      dependencies: { type: 'array' }
    }
  }

}

/**
 * Exports
 */
module.exports = Dependency
