'use strict'

/**
 * Dependencies
 * @ignore
 */
const _ = require('lodash')
const DependencyCollection = require('./DependencyCollection')
const Dependency = require('./Dependency')

/**
 * Symbols
 * @ignore
 */
const dependencies = Symbol()

/**
 * Injector
 *
 * @class
 * Dependencies are registered and maintained in memory by the Injector.
 *
 * Registering a dependency on the Injector validates it and determines which other
 * dependencies it requires. This does not invoke the `fn` property, if one is
 * provided.
 *
 * ```js
 * injector.register({
 *   name: 'server',
 *   type: 'factory',
 *   plugin: '<plugin.name>',
 *   fn: function (express, logger) {
 *     let server = express()
 *     server.use(logger)
 *     return server
 *   }
 * })
 * ```
 *
 * Getting a dependency from the Injector invokes the dependency's `fn` property as
 * a function and caches the return value on the `value` property for future calls
 * to `get`. This recursively satisfies the requirements of `fn`.
 *
 * ```js
 * injector.get('server')
 * => server

 * // this caches the return value of `fn` as `value`
 * => Dependency {
 *      name: 'server',
 *      type: 'factory',
 *      plugin: '<plugin.name>',
 *      fn: function (express, logger) { ... },
 *      value: server
 *    }
 * ```
 *
 * Invoking a dependency calls it's `fn` property as a function, without caching or
 * returning a result.
 *
 * ```js
 * injector.register({
 *   name: 'server:starter',
 *   type: 'callback',
 *   plugin: 'server',
 *   fn: function (server) {
 *     server.listen()
 *   }
 * })
 *
 * injector.invoke('server:starter')
 * ```
 *
 * Filtering a dependency returns a DependencyCollection instance filtered by a
 * predicate.
 *
 * ```js
 * injector.filter({ type: 'factory', plugin: 'MyPlugin' })
 * => DependencyCollection [
 *      Dependency { type: 'factory', plugin: 'MyPlugin', ... },
 *      Dependency { type: 'factory', plugin: 'MyPlugin', ... },
 *      Dependency { type: 'factory', plugin: 'MyPlugin', ... },
 *      // ...
 *    ]
 * ```
 */
class Injector {

  /**
   * Constructor
   *
   * @description Initialize the injector with a reference to itself as a dependency.
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
   *
   * @description Register a Dependency instance on the injector without invoking its
   * factory function.
   * @param {object} descriptor dependency properties
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
   *
   * @description
   * Get a dependency from the injector by invoking it's function or value property.
   * @param {string} name dependency name
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
   * @description
   * Lifecycle callbacks which use dependencies on the injector, but return no values
   * can be registered on the injector for event handling. This method invokes such
   * callbacks by name, providing any required dependencies as arguments. It fails
   * silently if no callback is found.
   *
   * @param {string} name dependency name
   *
   * @todo consider consolidating repeated code in invoke and get into a single 'internal'
   * #todo function and wrap it for get and invoke functionality
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
   *
   * @description Query the injector for dependencies matching a predicate
   * @param {object|function} predicate description or function for matching dependencies
   * @returns {DependencyCollection}
   */
  filter (predicate) {
    let collection = new DependencyCollection(this[dependencies])
    return collection.filter(predicate)
  }

}

module.exports = Injector
