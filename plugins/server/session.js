'use strict'

module.exports = function (plugin) {

  plugin
    .require({
      'connectRedis': 'connect-redis',
      'expressSession': 'express-session',
    })
    .factory('session', function (connectRedis, expressSession, redis, settings) {
      let RedisStore = connectRedis(expressSession)
      let sessionStore = new RedisStore({ client: redis })

      return expressSession({
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        secret: settings.session_secret,
        //proxy: true,
        //cookie: {
        //  secure: true
        //}
      })
    })

}
