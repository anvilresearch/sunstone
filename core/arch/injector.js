'use strict'

/**
 * Dependencies
 */

var _ = require('lodash')

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
 * Symbols
 */
const dependencies = Symbol()

/**
 * Injector
 */
class Injector {

  /**
   * Constructor
   */
  constructor () {
    this[dependencies] = {}
  }

  /**
   * Extract Dependencies
   * Adapted from AngularJS.
   */

  extractDependencies (fn) {
    let str = fn.toString().replace(STRIP_COMMENTS, '')
    let match = str.match(ARROW_ARG) || str.match(FN_ARGS)
    let args = match[1].split(FN_ARG_SPLIT)
    return args.map(str => str.trim())
  }

  /**
   * Register
   */
  register (descriptor) {
    let name = descriptor.name
    let factory = descriptor.factory
    let mutator = descriptor.mutator
    let value = descriptor.value

    if (!factory && !value && !mutator) {
      throw new Error('Plugin component must include factory, mutator, or value')
    }

    if (factory && !descriptor.dependencies) {
      descriptor.dependencies = this.extractDependencies(factory)
    }
    //  enabled
    //  scope/permissions
    this[dependencies][name] = descriptor
  }

  /**
   * Get
   */
  get (name) {
    let descriptor = this[dependencies][name]

    if (!descriptor) {
      // is there any case for failing silently?
      // logging an error?
      // or should we just explode?
      throw new Error(`Unknown dependency "${name}"`)
    }

    let value = descriptor.value

    if (!value) {
      let values = []
      let factory = descriptor.factory

      descriptor.dependencies.forEach((dependency) => {
        if (dependency) {
          values.push(this.get(dependency))
        }
      })

      value = descriptor.value = factory.apply(null, values)

      // check the interface and invoke additional methods?

      return value
    } else {
      return value
    }
  }

  /**
   * Find
   *
   * TODO:
   *  - where are we using this again?
   *  - should there be a method to query the dependencies
   *    without invoking the factories? or perhaps an extra argument
   *    to `find`?
   */
  find (predicate) {
    return _.filter(this[dependencies], predicate).map((descriptor) => {
      return this.get(descriptor.name)
    })
  }

}

module.exports = Injector
