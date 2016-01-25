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
 *
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
   *     .factory('RedisResource', function () {})
   *     .factory('MongoResource', function () {})
   *     .adapter('Resource', function (injector, settings) {
   *        // where settings.property is 'RedisResource' or 'MongoResource'
   *        return injector.get(settings.property)
   *     })
   *     .factory('User', function (Resource) {})
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
   *       User.extendSchema({
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
   * Assembler
   *
   * This can be used to define new types of components. For example, the core
   * framework probably doesn't need any knowledge of Express routers, but if you
   * wanted to define a specialized factory registrar for routers, you could do it
   * like so:
   *
   *    sunstone.plugin('server', {
   *      version: '0.0.0'
   *    })
   *    .assembler('router', function (injector) {
   *      let plugin = this
   *      return function (name, factory) {
   *        injector.register({
   *          name,
   *          type: 'router',
   *          plugin: plugin.name,
   *          factory
   *        })
   *      })
   *    })
   *
   * This makes a new dependency registrar called 'router' that can be used thusly:
   *
   *    sunstone.plugin('other', {
   *      version: '0.0.0'
   *    })
   *    .router('SomeRouter', function (Router, SomeResource) {
   *      let router = new Router()
   *
   *      router.get('endpoint', function () {
   *        SomeResource
   *          .list(req.query)
   *          .then(function (results) {
   *            res.json(results)
   *          })
   *          .catch(error => next(error))
   *      })
   *
   *      return router
   *    })
   *
   * The dependency inject can then be queried by this new "type" value.
   *
   *    injector.find({ type: 'router' })
   *
   * TODO
   * - there should possibly be a way to create a starter method automatically for
   *   an assembler to save that boilerplate
   */
  assembler (name, factory) {
    this[name] = factory(this[injector], this)
    return this
  }

  /**
   * Lifecycle Management
   *
   * These methods are used to register lifecycle methods that will be called
   * by the plugin manager
   */

  /**
   * Start
   *
   * Example:
   *
   *    sunstone.plugin(<NAME>, <MANIFEST>)
   *      .start(function (injector, server) {
   *        injector
   *          .find({ plugin: this.name, type: 'router' })
   *          .values()
   *          .forEach(router => {
   *            router.mount(server)
   *          })
   *      })
   */
  start (callback) {
    // where do we hold these callbacks?
    // can there be more than one per plugin?
    // and how do we retrieve them?
    // shouldn't be on the injector, because they're not dependencies
    // should probably be on the plugin somehow, so that we can call it from
    // a reference to the plugin, e.g., plugin.startCallback() (need better name)
    return this
  }

  /**
   * Stop
   */
  stop () {}

}

/**
 * Exports
 */
module.exports = Plugin
