'use strict'

/**
 * Test dependencies
 */
const cwd = process.cwd()
const path = require('path')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

/**
 * Assertions
 */
chai.use(sinonChai)
chai.should()
let expect = chai.expect

/**
 * Code under test
 */
const Dependency = require(path.join(cwd, 'core', 'arch', 'Dependency'))

/**
 * Tests
 */
describe('Dependency', () => {
  describe('extractDependencies', () => {
    describe('static method', () => {
      it('should return an array of dependency names')
    })

    describe('method', () => {
      it('should register the dependencies array on the dependency')
    })
  })

})
