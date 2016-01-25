'use strict'

/**
 * Dependencies
 */
const Validation = require('./Validation')

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



class Dependency {

  constructor (descriptor) {
    if (descriptor) {
      Object.keys(descriptor).forEach(key => {
        this[key] = descriptor[key]
      })

      if (this.factory && !descriptor.dependencies) {
        this.dependencies = this.extractDependencies()
      }
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

  validate () {
    let validation = new Validation()

    // assert presence
    validation.assert(this.name, 'name required')
    validation.assert(this.type, 'type required')
    validation.assert(this.plugin, 'plugin required')

    // assert type
    validation.assert(typeof this.name === 'string', 'name must be a string')
    validation.assert(typeof this.type === 'string', 'type must be a string')
    validation.assert(typeof this.plugin === 'string', 'plugin must be a string')

    // return if already invalid
    if (!validation.valid) {
      return validation
    }

    // validate known types 

    switch (this.type) {
      case 'factory':
      case 'adapter':
      case 'alias':
      case 'module':
        validation.assert(this.factory || this.value, `${this.name} requires a factory function or a value`)
        validation.assert(typeof this.factory === 'function', 'factory must be a function')
        break
      case 'extension':
      case 'callback':
        let functionName = this.type === 'extension' ? 'extension' : 'callback'
        validation.assert(this[attributeName], `${this.name} requires a ${attributeName} function`)
        validation.assert(typeof this[attributeName] === 'function', '${attributeName} must be a function')
        break
      default:
        // this.type is not one of the types defined by this architecture and cannot be validated further.
        break
    }

    return validation
  }

}

module.exports = Dependency