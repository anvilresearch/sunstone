'use strict'

/**
 * External dependencies
 */

var uuid = require('node-uuid')
var crypto = require('crypto')

/**
 * Defaults
 */

class Defaults {

  /**
   * UUID
   */

  static uuid () {
    return uuid.v4()
  }

  /**
   * Random
   */

  static random (len) {
    return () => {
      return crypto.randomBytes(len || 10).toString('hex')
    }
  }

  /**
   * Timestamp
   */

  static timestamp () {
    return Date.now()
  }

}

/**
 * Export
 */

module.exports = Defaults
