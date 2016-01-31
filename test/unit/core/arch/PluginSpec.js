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
const Plugin = require(path.join(cwd, 'core', 'arch', 'Plugin'))

/**
 * Tests
 */
describe('Plugin', () => {
  describe('constructor', () => {
    it('should initialize name')
    it('should initialize metadata')
    it('')
  })

  describe('require', () => {
    describe('with string argument', () => {
      it('should register the module on the injector')
    })

    describe('with array argument', () => {
      it('should register each module on the injector')
    })

    describe('with object argument', () => {
      it('should register each module on the injector')
    })
  })

  describe('include', () => {
    it('should be tested')
  })

  describe('module', () => {
    it('should register a node module on the injector')
  })

  describe('factory', () => {
    it('should register a factory on the injector')
  })

  describe('adapter', () => {
    it('should register an adapter on the injector')
  })

  describe('alias', () => {
    it('should register an alias on the injector')
  })

  describe('extension', () => {
    it('should register an extension on the injector')
  })

  describe('assembler', () => {
    it('should extend the plugin API')
  })

  describe('initializer', () => {
    it('should register an initializer callback')
  })

  describe('initialize', () => {
    it('should invoke the initializer')
  })

  describe('starter', () => {
    it('should register a starter callback')
  })

  describe('start', () => {
    it('should invoke the starter callback')
  })

  describe('stopper', () => {
    it('should register a stopper callback')
  })
  describe('stop', () => {
    it('should invoke the stopper callback')
  })
})
