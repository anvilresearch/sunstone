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
const Registry = require(path.join(cwd, 'src', 'arch', 'Registry'))

/**
 * Tests
 */
describe('Registry', () => {

  describe('constructor', () => {
    it('should initialize options')
    it('should initialize prioritized')
    it('should initialize default directories')
    it('should initialize optional directories')
  })

  describe('get', () => {
    it('should return a registered plugin')
    it('should not return an unknown plugin')
  })

  describe('set', () => {
    describe('with invalid plugin', () => {
      it('should throw an error')
    })

    describe('with valid plugin', () => {
      it('should register the plugin by name')
      it('should return the plugin')
    })
  })

  describe('del', () => {
    it('should remove plugin from the registry')
    it('should return the plugin')
  })

  describe('filter', () => {
    describe('with object predicate', () => {
      it('should return a PluginCollection')
    })

    describe('with function predicate', () => {
      it('should return a PluginCollection')
    })
  })

  describe('glob', () => {
    it('should find files in configured directories')
  })

  describe('require', () => {
    it('should require plugin definition files')
  })

  describe('resolve', () => {
    describe('with missing dependency', () => {
      it('should throw an error')
    })

    describe('with invalid version range', () => {
      it('should throw an error')
    })

    describe('with valid dependencies', () => {
      it('should link to dependents')
      it('should link to dependencies')
    })
  })

  describe('satisfy', () => {
    it('should be tested')
  })

  describe('prioritize', () => {
    it('should be tested')
  })

  describe('initialize', () => {
    it('should initialize prioritized plugins')
  })

  describe('plugin', () => {
    describe('with metadata argument', () => {
      it('should register a new plugin')
      it('should return the new plugin')
    })

    describe('without metadata argument', () => {
      it('should return a registered plugin')
    })
  })
})
