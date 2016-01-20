'use strict'

module.exports = function (plugin) {

  plugin
    .require(['ioredis'])
    .factory('redis', function (ioredis, settings) {
      return new ioredis(settings.redis)
    })

}
