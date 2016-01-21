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
    'Defaults': '../../core/data/Defaults',
    'Initializer': '../../core/data/Initializer',
    'Model': '../../core/data/Model',
    'Resource': '../../core/data/Resource'
  })

}
