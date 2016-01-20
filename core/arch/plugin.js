'use strict'

/**
 * Dependencies
 */
var _ = require('lodash')
var path = require('path')

/**
 * Symbols
 */
let injector = Symbol()

/**
 * Plugin
 *
 * TODO
 *  By itself this is not a plugin system. It's a way of
 *  grouping dependency definitions under a namespace with
 *  metadata (the manifest).
 *
 *  To make a plugin system, we need a way to dynamically
 *  load, reload, unload, instantiate, tear down, enable,
 *  disable, etc, while the application is running.
 *
 *  This capability is where the various
 *  `injector.register` functions may begin to
 *  differentiate themselves further.
 */
class Plugin {

  /**
   * Constructor
   */
  constructor (name, manifest, _injector) {
    this.name = name
    this.manifest = manifest
    this[injector] = _injector
  }

  /**
   * Require
   *
   * Adds dependencies to the injector by loading node modules.
   * Accepts a string, array or object.
   *
   * By passing an object, you can load from the file system or
   * alias the package name.
   *
   * Example
   *
   *    sunstone.plugin(<NAME>, <MANIFEST>)
   *      .require('express')
   *
   *      .require([
   *        'crypto',
   *        'ioredis'
   *      ])
   *
   *      .require({
   *        '_': 'lodash',
   *        'fs': 'fs-extra',
   *        'myLibrary': './myLibrary'
   *      })
   *
   * TODO
   * - path based requires are currently relative to this file.
   *   it might be better to make them relative to process.cwd()
   *   * require.resolve() can allow us to resolve the full path
   *     of a particular file, however in order to do so, it needs
   *     to be called from within the file itself.
   */
  require (modules) {
    if (typeof modules === 'string') {
      modules = { modules }
    }

    if (Array.isArray(modules)) {
      modules = _.zipObject(modules, modules)
    }

    Object.keys(modules).forEach((key) => {
      this.factory(key, function () {
        return require(modules[key])
      })
    })

    return this
  }

  /**
   * Include
   *
   * Bootstrapping recursively loads all index.js files in the plugins directory.
   * To make a new plugin, therefore you need to make a new directory.
   * Additional files in the directory are ignored. However plugins may become
   * larger than a single file can comfortable accommodate. Splitting a plugin
   * into several files can be accomplished with this method.
   *
   * Example:
   *
   *    // index.js
   *    'use strict'
   *
   *    module.exports = function (sunstone) {
   *      sunstone.plugin('MyResource', {
   *        version: '0.0.1',
   *        dependencies: {
   *          'Server': '0.0.1'
   *        }
   *      })
   *      .include(__dirname, 'other')
   *      .include(__dirname, 'yetanother')
   *    }
   *
   *    // other.js
   *    'use strict'
   *
   *    module.exports = function (plugin) {
   *
   *      plugin
   *        .factory('MyModel', function (a, b) {
   *          // ...
   *        })
   *        .router('MyModelRouter', function (MyModel) {
   *          // ...
   *        })
   *
   *    }
   */
  include () {
    let segments = Array.prototype.slice.call(arguments, this.include.length)
    let filepath = path.join.apply(null, segments)
    require(filepath)(this)
    return this
  }

  /**
   * Factory
   */
  factory (name, factory) {
    this[injector].register({
      name,
      type: 'factory',
      plugin: this.name,
      factory
    })

    return this
  }

  /**
   * Adapter
   *
   * Create factories that determin which implementation
   * to use at injection time.
   *
   * Example:
   *
   *   sunstone.plugin(<NAME>, <MANIFEST>)
   *     .factory('a', function () {})
   *     .factory('b', function () {})
   *     .adapter('c', function (injector, settings) {
   *        // where settings.property is 'a' or 'b'
   *        return injector.get(settings.property)
   *     })
   *     .factory('d', function (c) {})
   *
   *
   * TODO:
   *  - is "adapter" the right name for this?
   *  - is there any way enforce that it's used this way?
   */
  adapter (name, factory) {
    this[injector].register({
      name,
      type: 'adapter',
      plugin: this.name,
      factory
    })

    return this
  }

  /**
   * Alias
   *
   * Alias creates a reference to another item on the injector
   * within its own injector object. When the alias is injected
   * through the use of the injector.get() method it calls the
   * aliased dependency and creates a reference to the instance
   * in the dependency.value field.
   *
   * Example:
   * 
   *   sunstone.plugin(<NAME>, <MANIFEST)
   *   .factory('myDependency', function () {
   *     // ...
   *   })
   *
   *   .alias('myAlias', 'myDependency')
   * 
   */
  alias (alias, name) {
    this[injector].register({
      name: alias,
      type: 'alias',
      plugin: this.name,
      factory: () => {
        return this[injector].get(name)
      }
    })

    return this
  }

  /**
   * Extension
   *
   * The idea of an extension is that you can access some component
   * to use it's API without registering anything on the injector.
   *
   * This is useful for things like modifying a model's schema or
   * registering event handlers on an event emitter.
   *
   * Example 1:
   *
   *   sunstone.plugin('Default API', <MANIFEST>)
   *     .factory('User', function (Resource) {
   *       class User extends Resource {
   *         static get schema () {
   *           return Object.assign({}, super.schema, {
   *             name: { type: 'string' },
   *             email: { type: 'string', format: 'email' }
   *           })
   *         }
   *       }
   *
   *       return User
   *     })
   *
   *   sunstone.plugin('My Project', <MANIFEST>)
   *     .extension('UserExtension', function (User) {
   *       Object.assign(User.schema, {
   *         domainSpecificAttribute: { type: 'whatever', ... }
   *       })
   *     })
   *
   * Example 2:
   *
   *   sunstone.plugin(<NAME>, <MANIFEST>)
   *     .factory('emitter', function () {
   *        return new EventEmitter()
   *     })
   *
   *   sunstone.plugin('My Project', <MANIFEST>)
   *     .extension('CustomEventHandlers', function (emitter) {
   *        emitter.on('ready', function (event) {
   *          // do something
   *        })
   *     })
   */
  extension (name, mutator) {
    this[injector].register({
      name,
      type: 'extension',
      plugin: this.name,
      mutator
    })

    return this
  }

  /**
   * Router
   *
   * Plugins registered with this method will be mounted by the server
   * when bootstrapping.
   *
   * TODO
   * This introduces questions about the scope of the library/framework.
   *
   * It's necessary to be able to mount routers to a server when bootstrapping,
   * but that makes the library server specific.
   *
   * If we want this to be non-server-specific, there need to be a way to
   * extend the bootstrapping process and the plugin registration
   *
   * Can a plugin extend the bootstrapping process?
   *
   *    plugin.assembler('router', function (server) {
   *      plugin.find({
   *        type: 'router'
   *      }).forEach((router) => {
   *        server.use(router)
   *      })
   *    })
   *
   *  Maybe there's also a way to declare a "main" dependency that determines
   *  which component kicks off the bootstrap process via injector.get()
   */

  router (name, factory) {
    this[injector].register({
      name,
      type: 'router',
      plugin: this.name,
      factory
    })

    return this
  }

  /**
   * Connector
   */
  connector (name, factory) {
    this[injector].register({
      name,
      type: 'connector',
      plugin: this.name,
      factory
    })

    return this
  }

  /**
   * Lifecycle Management
   *
   * These methods are to be called by a service manager.
   */

  /**
   * Start
   */
  start () {}

  /**
   * Stop
   */
  stop () {}

}

/**
 * Exports
 */
module.exports = Plugin
