'use strict'

/**
 * Dependencies
 * @ignore
 */
const _ = require('lodash')
const path = require('path')
const injector = require('./injectorInstance')
const callsite = require('callsite')

/**
 * Symbols
 * @ignore
 */
let init = Symbol()

/**
 * Plugin
 *
 * @class
 * Instances of Plugin expose an API which can be accessed by the developer to
 * define plugins, along with methods used by the Registry to manage plugin lifecycle.
 *
 * The developer API can be used to:
 *
 *    - register node modules as dependencies on the injector
 *    - include files in the plugin definition for managing large plugins
 *    - define dependencies using factory methods
 *    - alias dependencies
 *    - create adapters to determine which implementation of an interface to
 *      use at runtime
 *    - access dependencies for mutation without creating new dependencies
 *    - extend the plugin API
 *    - register callbacks for managing plugin lifecycle
 *
 * @example <caption>Metadata</caption>
 * {
 *   version: '0.0.1',
 *   dependencies: {
 *     '<PLUGIN NAME>': '>=1.2.3'
 *   }
 * }
 * 
 */
class Plugin {

  /**
   * Constructor
   * 
   * @description
   * Initialize a new Plugin instance.
   * 
   * @param {string} name The name of the plugin
   * @param {object} metadata The plugin metadata
   *
   */ 
  constructor (name, metadata) {
    this.name = name
    this.metadata = metadata
  }

  /**
   * Require
   *
   * @description
   * Adds dependencies to the injector by loading node modules. Accepts a string,
   * array or object. By passing an object you can alias the package name.
   * 
   * @param {string | array | object} modules modules
   *
   * @example <caption>Usage</caption>
   *
   * sunstone.plugin(<NAME>, <METADATA>)
   *   .require('express')
   *
   *   .require([
   *     'crypto',
   *     'ioredis'
   *   ])
   *
   *   .require({
   *     '_': 'lodash',
   *     'fs': 'fs-extra',
   *     'myLibrary': './myLibrary'
   *   })
   *
   */
  require (modules) {
    if (typeof modules === 'string') {
      modules = { modules }
    }

    if (Array.isArray(modules)) {
      modules = _.zipObject(modules, modules)
    }

    Object.keys(modules).forEach((key) => {
      this.module(key, function () {
        return require(modules[key])
      })
    })

    return this
  }

  /**
   * Include
   *
   * @description
   * The bootstrapping process searches through the plugins directory looking for
   * plugins to load. To make a new plugin you simply create a sub-directory with an
   * index.js file. Additional files in the directory are incorporated using the
   * include method. This allows developers to separate out one plugin into an
   * arbitrary number of files.
   *
   * @param {string} filename Relative path to included file.
   *
   * @example <caption>Usage</caption>
   *
   * // index.js
   * 'use strict'
   *
   * module.exports = function (sunstone) {
   *   sunstone.plugin('MyResource', {
   *     version: '0.0.1',
   *     dependencies: {
   *       'Server': '0.0.1'
   *     }
   *   })
   *   .initializer(function (plugin) {
   *     .include('./other')
   *     .include('./yetanother')
   *   })
   * }
   *
   * // other.js
   * 'use strict'
   *
   * module.exports = function (plugin) {
   *
   *   plugin
   *     .factory('MyModel', function (a, b) {
   *       // ...
   *     })
   *     .router('MyModelRouter', function (MyModel) {
   *       // ...
   *     })
   *
   * }
   */
  include (filename) {
    // prepend file path from call stack onto the given, possibly relative, filename
    let caller = callsite()[1]
    let callerpath = caller.getFileName()
    let filepath = path.join(path.dirname(callerpath), filename)

    require(filepath)(this)

    return this
  }

  /**
   * Module
   *
   * @description
   * This is used internally by `plugin.require()` to register modules with
   * the type "module". This is important to maintain a distinction between
   * components provided by plugins defined in the host (or extending applications)
   * and components that originate from node modules.
   * 
   * @param {string} name Dependency name
   * @param {function} fn Factory function
   * @private
   */
  module (name, fn) {
    injector.register({
      name,
      type: 'module',
      plugin: this.name,
      fn
    })
  }

  /**
   * Factory
   *
   * @description
   * The factory method registers a new dependency on the injector, validates it, and
   * determines which other dependencies it requires.
   *
   * The first argument is the name of the new dependency and the second argument is a
   * function that returns the value of the dependency. However, this dependency is not
   * invoked at the time the dependency is registered.
   *
   * Getting a dependency from the Injector invokes the function and stores the return
   * value.
   *
   * @param {string} name Dependency name
   * @param {function} fn Factory function
   *
   * @example <caption>Usage</caption>
   *
   * plugin
   *   .factory('one', function () {
   *     return 1
   *   })
   *   .factory('two', function () {
   *     return 2
   *   })
   *   .factory('oneplustwo', function (one, two) {
   *     return one + two
   *   })
   *
   */
  factory (name, fn) {
    injector.register({
      name,
      type: 'factory',
      plugin: this.name,
      fn
    })

    return this
  }

  /**
   * Adapter
   *
   * @description
   * Create factories that determine which implementation
   * to use at injection time.
   *
   * @param {string} name Dependency name
   * @param {function} fn Factory function
   *
   * @example <caption>Usage</caption>
   *
   * sunstone.plugin(<NAME>, <METADATA>)
   *   .factory('RedisResource', function () {})
   *   .factory('MongoResource', function () {})
   *   .adapter('Resource', function (injector, settings) {
   *      // where settings.property is 'RedisResource' or 'MongoResource'
   *      return injector.get(settings.property)
   *   })
   *   .factory('User', function (Resource) {})
   *
   */
  adapter (name, fn) {
    injector.register({
      name,
      type: 'adapter',
      plugin: this.name,
      fn
    })

    return this
  }

  /**
   * Alias
   *
   * @description
   * Alias creates a reference to another item on the injector
   * within its own injector object. When the alias is injected
   * through the use of the injector.get() method it calls the
   * aliased dependency and creates a reference to the instance
   * in the dependency.value field.
   *
   * @param {string} alias New dependency name
   * @param {string} name Existing dependency name
   *
   * @example <caption>Usage</caption>
   *
   * sunstone.plugin(<NAME>, <METADATA)
   * .factory('myDependency', function () {
   *   // ...
   * })
   *
   * .alias('myAlias', 'myDependency')
   *
   */
  alias (alias, name) {
    injector.register({
      name: alias,
      type: 'alias',
      plugin: this.name,
      fn: () => {
        return injector.get(name)
      }
    })

    return this
  }

  /**
   * Extension
   *
   * @description
   * The idea of an extension is that you can access some component
   * to use it's API without registering anything on the injector.
   *
   * This is useful for things like modifying a model's schema or
   * registering event handlers on an event emitter.
   *
   * @param {string} name Dependency name
   * @param {function} fn Mutator function
   *
   * @example <caption>Extending Data Schema</caption>
   * 
   * // Given a plugin created as follows
   * sunstone.plugin('Default API', <METADATA>)
   *   .factory('User', function (Resource) {
   *     class User extends Resource {
   *       static get schema () {
   *         return Object.assign({}, super.schema, {
   *           name: { type: 'string' },
   *           email: { type: 'string', format: 'email' }
   *         })
   *       }
   *     }
   *
   *     return User
   *   })
   *
   * sunstone.plugin('My Project', <METADATA>)
   *   .extension('UserExtension', function (User) {
   *     User.extendSchema({
   *       domainSpecificAttribute: { type: 'whatever', ... }
   *     })
   *   })
   *
   * @example <caption>Adding Event Handler</caption>
   *
   * sunstone.plugin(<NAME>, <METADATA>)
   *   .factory('emitter', function () {
   *      return new EventEmitter()
   *   })
   *
   * sunstone.plugin('My Project', <METADATA>)
   *   .extension('CustomEventHandlers', function (emitter) {
   *      emitter.on('ready', function (event) {
   *        // do something
   *      })
   *   })
   */
  extension (name, fn) {
    injector.register({
      name,
      type: 'extension',
      plugin: this.name,
      fn
    })

    return this
  }

  /**
   * Assembler
   *
   * @param {string} name Dependency name
   * @param {function} fn Assembler function
   *
   * @description
   * This can be used to define new types of components. For example, the core
   * framework probably doesn't need any knowledge of Express routers, but if you
   * wanted to define a specialized factory registrar for routers, you could do it
   * like so:
   *
   * ```js
   * sunstone.plugin('server', {
   *   version: '0.0.0'
   * })
   * .assembler('router', function (injector) {
   *   let plugin = this
   *   return function (name, factory) {
   *     injector.register({
   *       name,
   *       type: 'router',
   *       plugin: plugin.name,
   *       factory
   *     })
   *   })
   * })
   * ```
   *
   * This makes a new dependency registrar called 'router' that can be used as follows:
   *
   * ```js
   * sunstone.plugin('other', {
   *   version: '0.0.0'
   * })
   * .router('SomeRouter', function (Router, SomeResource) {
   *   let router = new Router()
   *
   *   router.get('endpoint', function () {
   *     SomeResource
   *       .list(req.query)
   *       .then(function (results) {
   *         res.json(results)
   *       })
   *       .catch(error => next(error))
   *   })
   *
   *   return router
   * })
   * ```
   *
   * The dependency inject can then be queried by this new "type" value.
   *
   * ```js
   * injector.find({ type: 'router' })
   * ```
   *
   * TODO
   * - there should possibly be a way to create a starter method automatically for
   *   an assembler to save that boilerplate
   */
  assembler (name, fn) {
    this.constructor.prototype[name] = fn(injector, this)
    return this
  }

  /**
   * Lifecycle Management
   *
   * These methods are used to register lifecycle methods that will be called
   * by the plugin manager
   */

  /**
   * Initializer
   *
   * @description
   * Register an initializer function.
   *
   * @param {function} callback Initializer function
   * 
   * @example <caption>Usage</caption>
   *
   * module.exports = function (sunstone) {
   *   sunstone.plugin('MyResource', {
   *     version: '0.0.1',
   *     dependencies: {
   *       'Server': '0.0.1'
   *     }
   *   })
   *   .initializer(function (plugin) {
   *     .include('./other')
   *     .include('./yetanother')
   *   })
   * }
   *
   */
  initializer (callback) {
    this[init] = callback
    return this
  }

  /**
   * Initialize
   *
   * @description
   * Invoke the initializer function, if it exists. Fails silently.
   */
  initialize () {
    let fn = this[init]

    if (fn) {
      fn(this)
    }

    return this
  }

  /**
   * Starter
   *
   * @description
   * Register an starter function.
   *
   * @param {function} callback Starter function
   * 
   * @example <caption>Usage</caption>
   *
   * sunstone.plugin(<NAME>, <METADATA>)
   *   .initializer(function (plugin) {
   *     plugin.starter(function (injector, server) {
   *       injector
   *         .find({ plugin: this.name, type: 'router' })
   *         .values()
   *         .forEach(router => {
   *           router.mount(server)
   *         })
   *     })
   *   })
   *
   */
  starter (fn) {
    injector.register({
      name: `${this.name}:starter`,
      type: 'callback',
      plugin: this.name,
      fn
    })

    return this
  }

  /**
   * Start
   *
   * @description
   * Invoke the starter function, if it exists. Fails silently.
   */
  start () {
    injector.invoke(`${this.name}:starter`)
    return this
  }

  /**
   * Stopper
   *
   * @description
   * Register an initializer function.
   *
   * @param {function} callback Stopper function
   * 
   * @example <caption>Usage</caption>
   *
   * sunstone.plugin(<NAME>, <METADATA>)
   *   .initializer(function (plugin) {
   *     plugin.stopper(function (injector, server) {
   *       // code to disable plugin
   *     })
   *   })
   *
   */
  stopper (fn) {
    injector.register({
      name: `${this.name}:stopper`,
      type: 'callback',
      plugin: this.name,
      fn
    })

    return this
  }

  /**
   * Stop
   *
   * @description
   * Invoke the stopper function, if it exists. Fails silently.
   */
  stop () {
    injector.invoke(`${this.name}:stopper`)
    return this
  }

}

/**
 * Exports
 */
module.exports = Plugin
