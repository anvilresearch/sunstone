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
      dependency.extractDependencies()
      this[dependencies][dependency.name] = dependency
    } else {
      console.log(`Dependency[${dependency.name}]: `, validation.message)
      Object.keys(validation.errors).forEach(key => {
        console.log(`${key}: ${validation.errors[key].message}`)
      })
    }
  }

  /**
   * Get
   */
  get (name) {
    let dependency = this[dependencies][name]

    if (!dependency) {
      // is there any case for failing silently?
      // logging an error?
      // or should we just explode?
      throw new Error(`Unknown dependency "${name}"`)
    }

    let value = dependency.value

    if (!value) {
      let values = []
      let fn = dependency.fn
      dependency.dependencies.forEach((dependency) => {
        values.push(this.get(dependency))
      })

      value = dependency.value = fn.apply(null, values)

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
   *
   * TODO
   * consider consolidating repeated code in invoke and get into a single 'internal'
   * function and wrap it for get and invoke functionality
   */
  invoke (name) {
    let dependency = this[dependencies][name]

    if (dependency) {
      let values = []
      let fn = dependency.fn

      dependency.dependencies.forEach(item => {
        values.push(this.get(item))
      })

      fn.apply(null, values)
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
