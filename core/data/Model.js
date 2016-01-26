'use strict'

/**
 * Local dependencies
 */
const Collection = require('./Collection')
const Initializer = require('./Initializer')
const Validator = require('./validator')

/**
 * Model
 */
class Model {

  /**
   * Constructor
   */
  constructor (data, options) {
    this.initialize(data, options)
  }

  /**
   * Initialize (static)
   */
  static initialize (data, options) {
    // get a reference to class this
    // method is called on
    let Class = this

    // set options if not provided in arguments
    if (!options) {
      options = {}
    }

    // return null instead of a new instance
    // if the nullify options is provided
    if (!data && options.nullify) {
      return null
    }

    // if data is a string, deserialize it and return
    // the result of reinvoking initialize on the object
    // representation
    if (typeof data === 'string') {
      return Class.initialize(Class.deserialize(data), options)
    }

    // initialize the first element of an array or a
    // model collection
    if (Array.isArray(data)) {
      if (options.first) {
        return Class.initialize(data[0], options)
      } else {
        return new Collection(Class, data, options)
      }
    }

    // if we made it this far, it's time to get to work
    return new Class(data || {}, options)
  }

  /**
   * Initialize (prototype)
   */
  initialize (data, options) {
    let schema = this.constructor.schema
    let mappings = this.constructor.mappings

    options = options || {}

    if (typeof options.mapping === 'string') {
      options.mapping = mappings[options.mapping]
    }

    Initializer.initialize(schema, data, this, options)
  }

  /**
   * Validate (static)
   */
  static validate (data) {
    return Validator.validate(data, this.schema)
  }

  /**
   * Validate (prototype)
   */
  validate () {
    let schema = this.constructor.schema
    return Validator.validate(this, schema)
  }


  static map (target, source, mapping) {}
  static project (target, source, mapping) {}
  static select () {}


  merge () {}
  project () {}

  /**
   * Serialize
   */
  static serialize (object) {
    return JSON.stringify(object)
  }

  /**
   * Deserialize
   */
  static deserialize (data) {
    try {
      return JSON.parse(data)
    } catch (error) {
      throw error
    }
  }

}

/**
 * Export
 */
module.exports = Model
