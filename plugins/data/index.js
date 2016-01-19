'use strict'

module.exports = function (sunstone) {

  /**
   * Data plugin
   */
  sunstone.plugin('Data', {
    version: '0.0.0'
  })

  .require([
    'optimist',
    'mkdirp',
    'fs',
    'path',
    'crypto'
  ])

  .factory('argv', (optimist) => {
    return optimist.argv
  })

  .factory('Defaults', () => {
    return require('../../core/data/defaults')
  })

  .factory('Initializer', () => {
    return require('../../core/data/initializer')
  })

  .factory('Model', () => {
    return require('../../core/data/model')
  })

  .factory('Resource', () => {
    return require('../../core/data/resource')
  })

}
