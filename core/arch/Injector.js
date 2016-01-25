'use strict'

/**
 * Dependencies
 */
const _ = require('lodash')
const DependencyCollection = require('./DependencyCollection')
const Dependency = require('./Dependency') 

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
    this[dependencies] = {
      // Allow the injection of the injector itself
      injector: {
        name: 'injector',
        value: this
      }
    }
  }

  /**
   * Register
   */
  register (descriptor) {
    let dependency = new Dependency(descriptor)
    let validation = dependency.validate()
    if (validation.valid) {
      this[dependencies][dependency.name] = dependency
    }
    else {
      console.log('Dependency Validation Error', validation)
    }
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
   * Invoke
   *
   * Lifecycle callbacks which use dependencies on the injector, but return no values
   * can be registered on the injector for event handling. This method invokes such
   * callbacks by name, providing any required dependencies as arguments. It fails
   * silently if no callback is found.
   */
  invoke (name) {
    let descriptor = this[dependencies][name]

    if (descriptor) {
      let values = []
      let callback = descriptor.callback

      descriptor.dependencies(item => {
        if (item) {
          values.push(this.get(item))
        }
      })

      descriptor.callback.apply(null, values)
    }
  }

  /**
   * Filter
   *
   * Returns a DependencyCollection filtered by a predicate.
   */
  filter (predicate) {
    let collection = new DependencyCollection(this[dependencies], this)
    return collection.filter(predicate)
  }

}

module.exports = Injector
