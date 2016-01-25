'use strict'

/**
 * Symbols
 */
const plugins = Symbol()

/**
 * Registry
 *
 * Plugins are loaded and maintained in memory by the registry. Instances of
 * the Registry class can find and load plugins from the filesystem, resolve
 * plugin dependencies, order plugins such that their dependencies are all met,
 * and initialize plugins. This process is called bootstrapping and it is the
 * beginning of the plugin lifecycle.
 */
class Registry {

  /**
   * constructor
   */
  constructor (options, injector) {
    this.options = options
    this.injector = injector
    this[plugins] = new Map()
    this.prioritized = new PluginCollection()
    this.source = path.join(process.cwd(), 'plugins')
  }

  /**
   * get
   */
  get (name) {
    return this[plugins].get(name)
  }

  /**
   * set
   */
  set (name, plugin) {
    if (!(plugin instanceof Plugin) {
      let json = JSON.stringify(plugin)
      throw new Error(`${json} is not a Plugin instance.`)
    }

    this[plugins].set(name, plugin)
    return plugin
  }

  /**
   * del
   */
  del (name) {
    return this[plugins].delete(key)
  }

  /**
   * filter
   */
  filter (predicate) {
    return this.priority.filter(predicate)
  }

  /**
   * glob
   */
  glob () {
    return this.directories.reduce((results, directory) => {
      let pattern = path.join(directory, '**/index.js')
      let plugins = glob.sync(path.resolve(pattern))
      return results.push(...plugins)
    }, [])
  }

  /**
   * require
   */
  require () {
    let plugins = glob.apply(null, arguments)
    plugins.forEach(plugin => {
      require(plugin)(this)
    })
  }

  /**
   * resolve
   *
   * Resolves and validates dependencies and dependents of
   * all plugins.
   */
  resolve () {
    let plugins = this.plugins

    plugins.forEach(plugin => {
      let metadata = plugin.metadata
      let dependencies = new Map(metadata.dependencies || {})

      dependencies.forEach(range, name => {

        // validate presence
        let dependency = plugins[name]
        if (!dependency) {
          throw new Error(`Dependency ${name} missing.`)
        }

        // validate version
        let version = dependency.metadata.version
        if (!semver.satisfies(version, range)) {
          throw new Error(`${name} ${version} does not satisfy ${range}.`)
        }

        // link to dependents
        dependency.dependents = dependency.dependents || {}
        dependency.dependents[plugin.name] = plugin

        // link to dependencies
        plugin.dependencies = plugin.dependencies || {}
        plugin.dependencies[name] = dependency
      })
    })
  }

  /**
   * satisfy
   *
   * Given a list of plugins without dependencies and a list of
   * plugins with dependencies, return a list of plugins such that
   * no plugins appear before their dependencies.
   */
  satisfy (ordered, remaining) {
    let source = [].concat(remaining)
    let target = [].concat(ordered)

    // move satisfied dependencies from remaining to prioritized
    source.forEach((plugin, index) => {
      let dependencies = Object.values(plugin.dependencies)

      // check if the plugin's dependencies are satisfied
      let isSatisfied = dependencies.every(dependency => {
        return target.indexOf(dependency) !== -1
      })

      if (isSatisfied) {
        target.push(plugin)
        source.splice(index, 1)
      }
    })

    return (source.length === 0) ? target : this.satisfy(target, source)
  }

  /**
   * prioritize
   *
   * Given a list of plugins with dependencies, sort the list such that
   * all dependencies can be met by iterating over the list.
   */
  prioritize () {
    let ordered = []
    let remaining = [].concat(this[plugins])

    // separate the plugins that have no dependencies
    remaining.forEach((plugin, index) => {
      if (
        !plugin.dependencies ||
        Object.keys(plugin.dependencies).length === 0
      ) {
        ordered.push(plugin)
        remaining.splice(index, 1)
      }
    })

    // recurse through the remaining dependencies
    this.prioritized = this.satisfy(ordered, remaining)
  }

  /**
   * initialize
   *
   * Iterate over prioritized plugins and invoke initializer methods.
   */
  initialize () {
    this.prioritized.forEach(plugin => plugin.initialize())
  }

  /**
   * plugin
   */
  plugin (name, metadata) {
    if (metadata) {
      return this.set(name, new Plugin(name, metadata, this.injector))
    } else {
      return this.get(name)
    }
  }

}

/**
 * Exports
 */
module.exports = Registry
