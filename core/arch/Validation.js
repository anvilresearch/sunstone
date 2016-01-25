'use strict'

class Validation {

  constructor () {
    this.valid = true
    this.errors = []
  }

  assert (condition, errMsg) {
    if (!condition) {
      this.errors.push(errMsg)
      this.valid = false
    }
  }

}

module.exports = Validation