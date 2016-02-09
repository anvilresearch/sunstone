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
const Plugin = require(path.join(cwd, 'src', 'arch', 'Plugin'))

/**
 * Tests
 */
describe('Plugin', () => {
  var name = 'ExamplePlugin'
  var metadata = {
    version: '0.0.1',
    dependencies: {
      'Data': '>=0.0.1'
    },
  }

  const injector = require(path.join(cwd, 'src', 'arch', 'injectorInstance'))

  describe('constructor', () => {
    let examplePlugin

    before(() => {
      examplePlugin = new Plugin(name, metadata)
    })

    it('should initialize name', () => {
      examplePlugin.name.should.equal(name)
    })
    it('should initialize metadata', () => {
      examplePlugin.metadata.should.equal(metadata)
    })
  })

  describe('require', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
      sinon.spy(examplePlugin, 'module')
    })

    afterEach (() => {
      examplePlugin.module.restore()
    })

    describe('with string argument', () => {
      it('should register the module on the injector', () => {
        let modules = 'lodash'

        examplePlugin.require(modules)
        examplePlugin.module.should.have.been.calledWith(modules, modules)
      })
    })

    describe('with array argument', () => {
      it('should register each module on the injector', () => {
        let modules = ['lodash', 'callsite']

        examplePlugin.require(modules)
        examplePlugin.module.firstCall.should.have.been.calledWith(modules[0], modules[0])
        examplePlugin.module.secondCall.should.have.been.calledWith(modules[1], modules[1])
      })
    })

    describe('with object argument', () => {
      it('should register each module on the injector', () => {
        let modules = {
          'bodyParser': 'body-parser',
          'connectFlash': 'connect-flash'
        }

        examplePlugin.require(modules)
        examplePlugin.module.firstCall.should.have.been.calledWith('bodyParser', modules['bodyParser'])
        examplePlugin.module.secondCall.should.have.been.calledWith('connectFlash', modules['connectFlash'])
      })
    })

  })

  describe('include', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
      sinon.spy(require.extensions, '.js')
    })

    afterEach (() => {
      require.extensions['.js'].restore()
    })

    // if we stub require then include throws an error
    it.skip('should invoke a plugin extension', () => {
      let extensionName = '../../../resources/pluginExtension'

      examplePlugin.include(extensionName)
      let args = require.extensions['.js'].firstCall.args[0]
      require.extensions['.js'].should.have.been.calledWith(extensionName)
    })

  })

  describe('module', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
      sinon.spy(injector, 'register')
    })

    afterEach (() => {
      injector.register.restore()
    })

    it('should register a node module on the injector', () => {
      let injName = 'myDependency'
      let depName = 'node-dependency'

      examplePlugin.module(injName, depName)
      let args = injector.register.firstCall.args[0]

      args.name.should.equal(injName)
      args.type.should.equal('module')
      args.plugin.should.equal(name)
      // Can't test if the factory function is requiring the correct dependency
    })
  })

  describe('factory', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
      sinon.spy(injector, 'register')
    })

    afterEach (() => {
      injector.register.restore()
    })

    it('should register a factory on the injector', () => {
      let injName = 'myDependency'
      function test () {}

      examplePlugin.factory(injName, test)
      let args = injector.register.firstCall.args[0]
      args.name.should.equal(injName)
      args.type.should.equal('factory')
      args.plugin.should.equal(name)
      args.fn.should.equal(test)
    })
  })

  describe('adapter', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
      sinon.spy(injector, 'register')
    })

    afterEach (() => {
      injector.register.restore()
    })

    it('should register an adapter on the injector', () => {
      let injName = 'myDependency'
      function test () {}

      examplePlugin.adapter(injName, test)
      let args = injector.register.firstCall.args[0]
      args.name.should.equal(injName)
      args.type.should.equal('adapter')
      args.plugin.should.equal(name)
      args.fn.should.equal(test)
    })
  })

  describe('alias', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
      sinon.spy(injector, 'register')
    })

    afterEach (() => {
      injector.register.restore()
    })

    it('should register an alias on the injector', () => {
      let injName = 'myAlias'
      let depName = 'otherDependency'

      examplePlugin.alias(injName, depName)
      let args = injector.register.firstCall.args[0]
      args.name.should.equal(injName)
      args.type.should.equal('alias')
      args.plugin.should.equal(name)
    })
  })

  describe('extension', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
      sinon.spy(injector, 'register')
    })

    afterEach (() => {
      injector.register.restore()
    })

    it('should register an extension on the injector', () => {
      let injName = 'myDependency'
      function test () {}

      examplePlugin.extension(injName, test)
      let args = injector.register.firstCall.args[0]
      args.name.should.equal(injName)
      args.type.should.equal('extension')
      args.plugin.should.equal(name)
      args.fn.should.equal(test)
    })
  })

  describe('assembler', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
    })

    it('should extend the plugin API', () => {
      let test = sinon.spy()
      examplePlugin.assembler('myAPI', test)
      test.should.have.been.calledWith(injector, examplePlugin)
    })
  })

  describe('starter', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
      sinon.spy(injector, 'register')
    })

    afterEach (() => {
      injector.register.restore()
    })

    it('should register a starter callback on the injector', () => {
      function callback () {}
      let injName = `${name}:starter`

      examplePlugin.starter(callback)
      let args = injector.register.firstCall.args[0]
      args.name.should.equal(injName)
      args.type.should.equal('callback')
      args.plugin.should.equal(name)
      args.fn.should.equal(callback)
    })
  })

  describe('start', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
      sinon.spy(injector, 'invoke')
    })

    afterEach (() => {
      injector.invoke.restore()
    })

    it('should invoke the starter callback', () => {
      examplePlugin.start()
      injector.invoke.should.have.been.calledWith(`${examplePlugin.name}:starter`)
    })
  })

  describe('stopper', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
      sinon.spy(injector, 'register')
    })

    afterEach (() => {
      injector.register.restore()
    })

    it('should register a stopper callback on the injector', () => {
      function callback () {}
      let injName = `${name}:stopper`

      examplePlugin.stopper(callback)
      let args = injector.register.firstCall.args[0]
      args.name.should.equal(injName)
      args.type.should.equal('callback')
      args.plugin.should.equal(name)
      args.fn.should.equal(callback)
    })
  })

  describe('stop', () => {
    let examplePlugin

    beforeEach(() => {
      examplePlugin = new Plugin(name, metadata)
      sinon.spy(injector, 'invoke')
    })

    afterEach (() => {
      injector.invoke.restore()
    })

    it('should invoke the stopper callback', () => {
      examplePlugin.stop()
      injector.invoke.should.have.been.calledWith(`${examplePlugin.name}:stopper`)
    })
  })
})
