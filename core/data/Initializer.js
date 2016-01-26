'use strict'

/**
 * Initializer
 */

class Initializer {

  /**
   * Traverse
   *
   * Recursively iterates through a schema and invokes an operation
   * on each property.
   */

  static traverse (schema, source, target, operation, options) {
    Object.keys(schema).forEach((key) => {
      let descriptor = schema[key]

      // Recurse if the property is a nested schema.
      if (descriptor && descriptor.properties) {
        Initializer.traverse(
          descriptor.properties, // pass the nested schema
          source[key] || {}, // nested source object
          target[key] = {}, // initialize the nested target object
          operation,
          options
        )

      // Invoke the operation for this property
      } else {
        operation(key, descriptor, source, target, options)
      }
    })
  }

  /**
   * Assign
   *
   * This function is invoked by `traverse`, and operates on one
   * property at a time. It sets a value on a target object based
   * on:
   *
   * 1. a property descriptor defined in the schema.
   * 2. a value derived from a source object
   * 3. a set of options
   *
   * Together, `traverse` and `assign` mutate a target object rather
   * than providing a return value. Although a functional style might
   * result in cleaner code, JavaScript doesn't allow replacing `this`
   * within a constructor function. To consistent, we stick with
   * an imperative style throughout this module.
   */

  static assign (key, descriptor, source, target, options) {
    let value = source[key]

    if (descriptor && !descriptor.private || options.private) {

      // define an immutable property
      if (value && descriptor.immutable) {
        Object.defineProperty(target, key, {
          writable: false,
          enumerable: true,
          value: value
        })

      // invoke a setter method
      } else if (typeof descriptor.set === 'function') {
        descriptor.set.call(target, source)

      // simple assignment
      } else if (value !== undefined) {
        target[key] = value

      // assign default value
      } else if (descriptor.default && options.defaults !== false) {
        let defaultValue = descriptor.default
        target[key] = (typeof defaultValue === 'function')
          ? defaultValue()
          : defaultValue
      }

      // trim string values if requested
      if (descriptor.trim) {
        let trimLeading = descriptor.trim === true || descriptor.trim.leading
        let trimTrailing = descriptor.trim === true || descriptor.trim.trailing

        if (descriptor.type === 'string' && typeof target[key] === 'string') {
          if (trimLeading) {
            target[key] = target[key].replace(/^\s+/, '')
          }
          if (trimTrailing) {
            target[key] = target[key].replace(/\s+$/, '')
          }
        } else if (descriptor.type === 'array' && Array.isArray(target[key])) {
          for (let i = 0; i < target[key].length; i++) {
            if (typeof target[key][i] === 'string') {
              if (trimLeading) {
                target[key][i] = target[key][i].replace(/^\s+/, '')
              }
              if (trimTrailing) {
                target[key][i] = target[key][i].replace(/\s+$/, '')
              }
            }
          }
        }
      }

      // delete property if explicitly undefined
      if (Array.isArray(options.$unset) &&
        options.$unset.indexOf(key) !== -1) {
        delete target[key]
      }
    }

    // invoke "after" method
    if (descriptor.after && value !== undefined) {
      descriptor.after.call(target, source)
    }
  }

  /**
   * Map
   */

  static map (mapping, source, target) {
    Object.keys(mapping).forEach(function (path) {
      let from = mapping[path]
      let to = path.split('.')
      if (typeof from === 'function') {
        let value = from(source)
        if (value) {
          Initializer.setDeepProperty(target, to, value)
        }
      } else {
        Initializer.setDeepProperty(
          target,
          to,
          Initializer.getDeepProperty(source, from.split('.'))
        )
      }
    })
  }

  /**
   * Project
   */

  static project (mapping, source, target) {
    Object.keys(mapping).forEach(function (path) {
      let from = path.split('.')
      let to = mapping[path].split('.')
      Initializer.setDeepProperty(
        target,
        to,
        Initializer.getDeepProperty(source, from)
      )
    })
  }

  /**
   * Select
   *
   * Initialize a subset of an object by providing
   * a selection (array of property "chain" strings).
   * We can think of a selection as a shorthand or
   * macro (in the lisp sense) for a mapping. Select
   * is used by `Modinha.prototype.initialize`.
   *
   * Example:
   *
   *   Model.initialize({
   *     a: 'a',
   *     b: { c: 'c' },
   *     d: 'd'
   *   }, {
   *     select: ['b.c', 'd']
   *   })
   */

  static select (properties, source, target) {
    let mapping = {}

    properties.forEach(function (property) {
      mapping[property] = property
    })

    Initializer.map(mapping, source, target)
  }

  /**
   * Get deep property
   */

  static getDeepProperty (source, chain) {
    let key = chain.shift()

    // there's nothing to see here, move along
    if (source[key] === undefined) { return }
    // if property is null then return null
    if (source[key] === null) { return null }
    // if property is false then return false
    if (source[key] === false) { return false }
    // if property is '' then return false
    if (source[key] === '') { return '' }
    // we're at the end of the line, this is the value you're looking for
    if (source[key] && chain.length === 0) { return source[key] }
    // traverse the object
    if (source[key] !== undefined) {
      return Initializer.getDeepProperty(source[key], chain)
    }
  }

  /**
   * Set deep property
   */

  static setDeepProperty (target, chain, value) {
    let key = chain.shift()

    if (chain.length === 0 && value !== undefined) {
      target[key] = value
    } else if (chain.length !==0) {
      if (!target[key]) { target[key] = {} }
      Initializer.setDeepProperty(target[key], chain, value)
    }
  }

  /**
   * Initialize
   */

  static initialize (schema, source, target, options) {
    if (!source) { source = {} }
    if (!options) { options = {} }

    if (options.mapping) {
      Initializer.map(options.mapping, source, target)
    } else if (options.select) {
      Initializer.select(options.select, source, target)
    } else {
      Initializer.traverse(schema, source, target, Initializer.assign, options)
    }
  }

}

/**
 * Export
 */

module.exports = Initializer
