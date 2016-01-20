'use strict'

module.exports = function (sunstone) {

  /**
   * Data plugin
   */
  sunstone.plugin('Data', {
    version: '0.0.1'
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

  .require({
    'Defaults': '../../core/data/defaults',
    'Initializer': '../../core/data/initializer',
    'Model': '../../core/data/model',
    'Resource': '../../core/data/resource'
  })

}
