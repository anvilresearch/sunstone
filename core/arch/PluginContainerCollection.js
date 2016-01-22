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
          throw new Error (`Dependency ${dependencyName} missing`)
        }
        let dependencyVersion = plugins[dependencyName].manifest.version
        if (!semver.satisfies(dependencyVersion, version)) {
          throw new Error (
            `${dependencyName} {$dependencyVersion} does not satisfy ${version}`
          )
        }

        // Create links
        let dependents = dependency.dependents = dependency.dependents || {}
        dependents[plugin.name] = plugin
        let pluginDependencies = plugin.dependencies = plugin.dependencies || {}
        pluginDependencies[dependencyName] = dependency
      })
    })
  }

  /**
   * Prioritize
   *
   * Creates an ordered array of plugin names and stores it on the instance
   * Plugins are ordeded according to their initialization order.
   */
   prioritize() {
    let remaining = _.values(this.plugins)
    let prioritized = []
    let count = 0

    // filter plugin list retrieving only plugins with no dependencies
    remaining.filter(plugin => {
      return !plugin.dependencies || Object.keys(plugin.dependencies).length === 0
    })
    // iterate through filtered list
    .forEach(plugin => {
      // remove from remaining
      let index = remaining.indexOf(plugin) 
      remaining.splice(index, 1)
      // push name to prioritized
      prioritized.push(plugin.name)
    })

    // Recursively prioritize remaining plugins
    function prioritize (prioritized, remaining) {
      let results = [].concat(prioritized)
      remaining = [].concat(remaining)
      
      // filter plugin list retrieving only plugins where the dependencies are satisfied
      _.filter(remaining, plugin => {
        return _.every(plugin.dependencies, dependency => {
          return prioritized.indexOf(dependency.name) !== -1
        })
      })
      // iterate through filtered plugin list
      .forEach(plugin => {
        // remove from remaining
        let index = remaining.indexOf(plugin) 
        remaining.splice(index, 1)
        // push name to prioritized
        results.push(plugin.name)
      })

      if (remaining.length === 0) {
        return results
      } else {
        // concatenate results of recursion to current state and return
        return prioritize(results, remaining)
      }
    }

    this.prioritized = prioritize(prioritized, remaining)
  }

  /**
   * Register
   *
   * Stores a contained plugin on the current instance of the collection
   */
  register (plugin) {
    this.plugins[plugin.name] = plugin
  }

}

 /**
 * Exports
 */
module.exports = PluginContainerCollection