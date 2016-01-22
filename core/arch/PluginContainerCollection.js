'use strict'

/**
 * Native Dependencies
 */

/**
 * External Dependencies
 */
var _ = require('lodash')
var semver = require('semver')

/**
 * Local Dependencies
 */

/**
 * PluginContainerTree
 */
class PluginContainerCollection {

  constructor (root) {
    this.plugins = {}
    this.prioritized = []
  }

  /**
   * Resolve
   * 
   * Resolves and validates dependencies and dependents of
   * all plugins.
   */
  resolve () {
    let plugins = this.plugins
    _(plugins).forEach(plugin => {
      let manifest = plugin.manifest
      let dependencies = manifest.dependencies || {}
      _(dependencies).forEach((version, dependencyName) => {
        // Check that dependency and version are satisfied
        let dependency = plugins[dependencyName]
        if (!dependency) {
          throw new Error (/* Plugin missing */)
        }
        let dependencyVersion = plugins[dependencyName].manifest.version
        if (!semver.satisfies(dependencyVersion, version)) {
          throw new Error(/* Version mismatch */)
        }

        // Create links
        let dependents = dependency.dependents = dependency.dependents || {}
        dependents[plugin.name] = plugin
        let pluginDependencies = plugin.dependencies = plugin.dependencies || {}
        pluginDependencies[dependencyName] = dependency
      })
    })

    this.prioritized = prioritize()
  }

  /**
   * Prioritize
   *
   * Creates an ordered array of plugin names.
   * Plugins are ordeded according to their initialization order.
   */
  prioritize (remaining) {
    let prioritized = []
    remaining = remaining || _.values(this.plugins)

    // Get plugins with no dependencies
    if (prioritized.length === 0) {
      _(remaining)
      .filter({ dependencies: {} })
      .forEach(plugin => {
        // remove from remaining
        let index = remaining.indexOf(plugin) 
        remaining.splice(index, 1)
        // push name to prioritized
        prioritized.push(plugin.name)
      })
    }

    if (remaining && remaining.length > 0) {
      _(remaining)
      .filter(plugin => {
        return _(plugin.dependencies).every(dependency => {
          return prioritized.indexOf(dependency.name) !== -1
        })
      })
      .forEach(plugin => {
        // remove from remaining
        let index = remaining.indexOf(plugin) 
        remaining.splice(index, 1)
        // push name to prioritized
        prioritized.push(plugin.name)
      })

      if (remaining.length > 0) {
        let descendents = this.prioritize(remaining)
        if (descendents.length === 0) {
          throw new Error('Invalid dependency resolution')
        }
        prioritized = prioritized.concat(descendents)
      }
    }
    else {
      return prioritized
    }
  }

  register (plugin) {
    this.plugins[plugin.name] = plugin
  }

}

 /**
 * Exports
 */
module.exports = PluginContainerCollection