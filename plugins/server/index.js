'use strict'

module.exports = function (sunstone) {

  /**
   * Plugin
   */
  sunstone.plugin('Server', {
    version: '0.0.0'
    // requires: ['Data']
  })

  /**
   * Module dependencies
   */
  .require([
    'express'
  ])

  /**
   * Settings
   */
  .factory('Settings', function (Model, Initializer, argv, mkdirp, fs, path, crypto) {

    class Settings extends Model {

      static get schema () {
        return {
          host: {
            type: 'string',
            set: Settings.set('host', 'localhost')
          },
          port: {
            type: 'number',
            set: Settings.set('port', 3000, parseInt)
          },
          redis: {
            type: 'object',
            properties: {
              host: {
                type: 'string',
                set: Settings.set('redis-host', 'localhost')
              },
              port: {
                type: 'number',
                set: Settings.set('redis-port', 6379, parseInt)
              }
            }
          },
          cookie_secret: {
            type: 'string',
            default: () => {
              return crypto.randomBytes(10).toString('hex')
            }
          }
        }
      }

      /**
       * Setter
       *
       * Looks for values in command line options, environment variables, and the source
       * object (config file), in that order. If none are found, a default value is set.
       */
      static set (key, defaultValue, formatter) {
        return function (source) {
          let value =
            argv[key] ||
            process.env[key.toUpperCase().replace('-', '_')] ||
            source[key] ||
            defaultValue

          Initializer.setDeepProperty(
            this,
            key.split('-').slice(-1),
            formatter ? formatter(value) : value
          )
        }
      }

      /**
       * Read
       */
      static read (filepath) {
        let writeAfterValidate = false

        try {
          // attempt to load and parse the given file
          var data = this.deserialize(fs.readFileSync(filepath))
        } catch (error) {
          // ignore error due to non-existing file
          if (error.code !== 'ENOENT') { throw error }

          // indicate the config should be written to
          // filepath after validation
          writeAfterValidate = true
        }

        // instantiate a config instance
        let settings = new Settings(data)

        // validate
        let validation = settings.validate()
        if (!validation.valid) {
          console.log(validation)
          process.exit(1)
        }

        // write config to file if indicated
        if (writeAfterValidate) {
          settings.write(filepath)
        }

        // return the configuration
        return settings
      }

      /**
       * Write
       */
      write (filepath) {
        let data = Settings.serialize(this)
        mkdirp.sync(path.dirname(filepath))
        fs.writeFileSync(filepath, data)
      }

      /**
       * Serialize
       */
      static serialize (obj) {
        return JSON.stringify(obj, false, 2)
      }

      /**
       * Deserialize
       */
      static deserialize (data) {
        try {
          return JSON.parse(data)
        } catch (error) {
          throw (error)
        }
      }

    }

    return Settings
  })

  /**
   * settings
   */
  .factory('settings', function (Settings,path) {

    let settings = Settings.read(path.join(process.cwd(), 'settings.json'))
    console.log('SETTINGS', settings)
    return settings
  })

  /**
   * server
   */
  .factory('server', function (express,settings) {
    let server = express()
    // build up the server
    return server
  })

}

