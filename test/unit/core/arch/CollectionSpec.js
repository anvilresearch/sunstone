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
const Collection = require(path.join(cwd, 'core', 'arch', 'Collection'))
const PluginCollection = require(path.join(cwd, 'core', 'arch', 'PluginCollection'))
const DependencyCollection = require(path.join(cwd, 'core', 'arch', 'DependencyCollection'))

/**
 * Tests
 */
describe('Collection', () => {
  describe('constructor', () => {
    it('should initialize collection')
    it('')
  })

  describe('filter', () => {
    describe('with object argument', () => {
      it('should filter the collection according to the predicate')
      it('should return a Collection')
    })

    describe('with function argument', () => {
      it('should filter the collection according to the predicate function')
      it('should return a Collection')
    })
  })

})

describe('PluginCollection', () => {
  describe('filter', () => {
    it('should return a PluginCollection')
  })

  describe('start', () => {
    it('should call plugin.start on all plugins in the collection')
  })
})

describe('DependencyCollection', () => {
  describe('filter', () => {
    it('should return a DependencyCollection')
  })

  describe('values', () => {
    it('should call injector.get for all dependencies in the collection')
  })
})