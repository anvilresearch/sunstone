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
const Injector = require(path.join(cwd, 'src', 'arch', 'Injector'))

/**
 * Tests
 */
describe('Injector', () => {
  describe('register', () => {
    it('should register the dependency on the injector')
  })

  describe('get', () => {
    describe ('with an invalid dependency', () => {
      it('should throw an error')
    })

    describe('with a valid dependency', () => {
      describe('and the dependency has been fetched before', () => {
        it('should return the dependency')
      })

      describe('and the dependency has not been fetched yet', () => {
        it('should invoke the dependency\'s factory function')
        it('should return the dependency value')
      })

    })

  })

  describe('invoke', () => {
    describe('with an invalid dependency name', () => {
      it('should do nothing')
    })

    describe('with a valid dependency name', () => {
      it('should invoke a callback on the injector')
    })

  })

  describe('filter', () => {
    it('should return a new DependencyCollection')
  })

})
