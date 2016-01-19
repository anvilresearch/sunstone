'use strict'

/**
 * External dependencies
 */

var inflection = require('inflection')

/**
 * Local dependencies
 */

var redis = require('../boot/redis')
var Model = require('./model')

/**
 * Resource
 */

class Resource extends Model {

  /**
   * Redis getter
   */

  static get redis () {
    return redis
  }

  static get uniqueId () {
    return '_id'
  }

  /**
   * Collection
   */

  static get collection () {
    return inflection.pluralize(this.name.toLowerCase())
  }

  /**
   * List
   */

  static list (options) {
    return new Promise((resolve, reject) => {
      options = options || {}
      options.order = options.order || 'normal'

      let resource = this
      let redis = resource.redis
      let collection = resource.collection

      // set default index
      let index = options.index || collection + ':created'

      // order to get a range of ids
      let range = options.order === 'normal' ? 'zrange' : 'zrevrange'

      // default page and size
      let page = options.page || 1
      let size = options.size || 50

      // calculate start and end index
      // for the sorted set range lookup
      let startIndex = (size * (page - 1))
      let endIndex = (startIndex + size) - 1

      redis[range](index, startIndex, endIndex)
        .then(ids => {
          if (!ids || ids.length === 0) {
            resolve(null)
          }

          return resource.get(ids, options)
        })
        .then(instances => {
          resolve(instances)
        })
        .catch(error => reject(error))
    })
  }

  /**
   * Get
   */

  static get (ids, options) {
    return new Promise((resolve, reject) => {
      options = options || {}

      let resource = this
      let redis = resource.redis
      let collection = resource.collection

      // return an object instead of an array
      // if the first argument is a string
      if (typeof ids === 'string') {
        options.first = true
      }

      // don't call hmget with undefined ids
      if (!ids) {
        resolve(null)
      }

      // don't call hmget with an empty array
      if (Array.isArray(ids) && ids.length === 0) {
        resolve([])
      }

      // if redis responds with undefined or null
      // values, initialization should provide null
      // instead of an instance, and defaults should
      // not be generated
      options.nullify = true
      options.defaults = false

      // send redis the hash multiget command
      redis
        .hmget(collection, ids)
        .then(result => resolve(resource.initialize(result, options)))
        .catch(error => reject(error))
    })
  }

  /**
   * Insert
   */

  static insert (data, options) {
    return new Promise((resolve, reject) => {
      options = options || {}

      let resource = this
      let redis = resource.redis
      let collection = resource.collection
      let uniqueId = resource.uniqueId

      // validate the data
      let instance = resource.initialize(data, { private: true })
      let validation = instance.validate()



      resource
        .enforceUnique(instance)
        .then(() => {
          let multi = redis.multi()
          multi.hset(collection, instance[uniqueId], resource.serialize(instance))
          resource.index(multi, instance)
          return multi.exec()
        })
        .then(result => resolve(resource.initialize(instance, options)))
        .catch(error => reject(error))
    })
  }

  /**
   * Replace
   */

  /**
   * Patch
   */

  static patch (id, data, options) {
    return new Promise((resolve, reject) => {
      options = options || {}

      let resource = this
      let redis = resource.redis
      let collection = resource.collection
      let uniqueId = resource.uniqueId

      // get the existing data
      resource
        .get(id, { private: true })
        .then(instance => {
          // not found
          if (!instance) { resolve(null) }

          // copy the original (for reindexing)
          let original = resource.initialize(instance, { private: true})

          // merge the new values into the instance
          // without generating default values
          options.defaults = false
          instance.merge(data, options)

          // update the timestamp
          instance.modified = Default.timestamp()

          // validate the mutated instance
          let validation = instance.validate()
          if (!validation.valid) { reject(validation) }

          resource
            .enforceUnique(instance)
            .then(() => {
              // batch operations
              let multi = redis.multi()

              // store the instance
              multi.hset(
                collection,
                instance[uniqueId],
                resource.serialize(instance)
              )

              // index the instance
              resource.reindex(multi, instance, original)

              // execute the set of ops
              return multi.exec()
            })
            .then(result => resolve(resource.initialize(instance, options)))

        })
        .catch(error => reject(error))

    })
  }

  /**
   * Delete
   */

  static delete (id) {
    return new Promise((resolve, reject) => {
      let resource = this
      let redis = resource.redis
      let collection = resource.collection

      // Get the object so that it can be deindexed
      resource
        .get(id, { private: true })
        .then(result => {
          // not found
          if (!result) { resolve(null) }

          // batch operations
          let multi = redis.multi()

          // remove the instance(s)
          multi.hdel(collection, id)

          // leave no trace in the indexes
          if (!(result instanceof Array)) { result = [result] }
          result.forEach(instance => resource.deindex(multi, instance))

          // execute the set of ops
          return multi.exec()
        })
        .then(result => resolve(true))
        .catch(error => reject(error))
    })
  }


  static index (multi, data) {}
  static deindex (multi, data) {}
  static reindex (multi, data) {}
  static indexKey (args, data) {}
  static indexValue (args, data) {}
  static defineIndex (config) {}
  static indexUnique (property) {}
  static indexSecondary (property, score) {}
  static indexReference (property, reference, score) {}
  static indexOrder (score) {}

  static enforceUnique (data) {
    return new Promise((resolve, reject) => {
      // TODO
      resolve(null)
    })
  }

  static intersects (collection, unique) {}
  static __postExtends () {}
  static getByUnique (collection, key, value, options) {}
  static listBySecondary(collection, key, value, options) {}
  static listByReference(collection, key, reference, referenceId, options) {}
  static listNewest (options) {}
  static listEarliest (options) {}

}

/**
 * Export
 */

module.exports = Resource
