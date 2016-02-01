'use strict'

/**
 * Test dependencies
 */
const cwd = process.cwd()
const path = require('path')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const _ = require('lodash')
const Plugin = require(path.join(cwd, 'core', 'arch', 'Plugin'))
const Dependency = require(path.join(cwd, 'core', 'arch', 'Dependency'))

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
    let collection
    let collectionData = {
      a: 0,
      b: 1,
      c: 2,
      d: 3
    }

    beforeEach(() => {
      collection = new Collection(collectionData)
    })

    it('should initialize collection', () => {
      _(collectionData).values().each((item) => {
        expect(collection).to.include(item)
      })
    })
  })

  describe('filter', () => {
    let collection
    let collectionData = {
      a: { name: 'a', type: 1 },
      b: { name: 'b', type: 2 },
      c: { name: 'c', type: 1 },
      d: { name: 'd', type: 2 },
      e: { name: 'e', type: 1 },
    }

    beforeEach(() => {
      collection = new Collection(collectionData)
    })

    describe('with object argument', () => {
      let result
      beforeEach(() => {
        result = collection.filter({ type: 1 })
      })

      it('should filter the collection according to the predicate', () => {
        result.length.should.equal(3)
      })

      it('should return a Collection', () => {
        result.should.be.a.instanceof(Collection)
        result.should.not.be.an.instanceof(PluginCollection)
        result.should.not.be.an.instanceof(DependencyCollection)
      })
    })

    describe('with function argument', () => {
      let result
      beforeEach(() => {
        result = collection.filter(item => {
          return item.type === 2
        })
      })

      it('should filter the collection according to the predicate function', () => {
        result.length.should.equal(2)
      })

      it('should return a Collection', () => {
        result.should.be.an.instanceof(Collection)
        result.should.not.be.an.instanceof(PluginCollection)
        result.should.not.be.an.instanceof(DependencyCollection)
      })

    })

  })

})

describe('PluginCollection', () => {
  describe('filter', () => {
    let collection, result
    let collectionData = {
      a: { name: 'a', type: 1 },
      b: { name: 'b', type: 2 },
      c: { name: 'c', type: 1 },
      d: { name: 'd', type: 2 },
      e: { name: 'e', type: 1 },
    }

    beforeEach(() => {
      collection = new PluginCollection(collectionData)
      result = collection.filter()
    })

    it('should return a PluginCollection', () => {
      result.should.be.an.instanceof(Collection)
      result.should.be.an.instanceof(PluginCollection)
      result.should.not.be.an.instanceof(DependencyCollection)
    })
  })

  describe('start', () => {
    let collection
    let collectionData = {
      a: new Plugin('MyPlugin', { version: '0.0.0' }),
      b: new Plugin('MySecondPlugin', { version: '0.0.0'})
    }

    beforeEach(() => {
      collection = new PluginCollection(collectionData)
      sinon.spy(collectionData.a, 'start')
      sinon.spy(collectionData.b, 'start')
    })

    afterEach(() => {
      collectionData.a.start.restore()
      collectionData.b.start.restore()
    })

    it('should call plugin.start on all plugins in the collection', () => {
      collection.start()
      collectionData.a.start.should.have.been.called
      collectionData.b.start.should.have.been.called
    })
  })
})

describe('DependencyCollection', () => {
  describe('filter', () => {
    let collection, result
    let collectionData = {
      a: new Dependency({  })
    }

    beforeEach(() => {
      collection = new DependencyCollection(collectionData)
      result = collection.filter({ type: 2 })
    })

    it('should return a DependencyCollection', () => {
      result.should.be.an.instanceof(Collection)
      result.should.be.an.instanceof(DependencyCollection)
      result.should.not.be.an.instanceof(PluginCollection)
    })
  })

  // this wouldn't let me test unless I put the dependencies on the injector
  describe('values', () => {
    let collection
    let depNames = ['Dep1', 'Dep2']
    let injector = require(path.join(cwd, 'core', 'arch', 'injectorInstance'))

    depNames.forEach(name => {
      injector.register({
        name,
        type: 'callback',
        plugin: 'MyPlugin',
        fn: function () {}
      })
    })

    beforeEach(() => {
      collection = injector.filter({ plugin: 'MyPlugin' })
      sinon.spy(injector, 'get')
    })

    afterEach(() => {
      injector.get.restore()
    })

    it('should call injector.get for all dependencies in the collection', () => {
      collection.values()
      injector.get.should.have.been.calledWith(depNames[0])
      injector.get.should.have.been.calledWith(depNames[1])
    })
  })
})