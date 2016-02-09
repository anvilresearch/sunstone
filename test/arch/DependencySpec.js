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
const Dependency = require(path.join(cwd, 'src', 'arch', 'Dependency'))

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

  describe('schema', () => {
    it('should require a name')
    it('should require a type')
    it('should require a plugin')
    it('should require a factory function or a value')
  })

})
