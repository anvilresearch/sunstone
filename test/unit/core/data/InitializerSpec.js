'use strict'

/**
 * Test dependencies
 */
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
const Initializer = require(path.join(process.cwd(), 'core', 'data', 'Initializer'))
const initialize = Initializer.initialize
const traverse = Initializer.traverse
const assign = Initializer.assign
const select = Initializer.select
const map = Initializer.map
const project = Initializer.project
const getDeepProperty = Initializer.getDeepProperty
const setDeepProperty = Initializer.setDeepProperty

/**
 * Tests
 */
describe('Initializer', () => {

  /**
   * Traverse
   */
  describe('traverse', () => {
    let schema, source, target, operation

    beforeEach(() => {
      schema = {
        a: { type: 'string' },
        b: { type: 'string' },
        c: { properties: { d: { type: 'string' } } }
      }

      source = {
        a: 'a',
        b: 'b',
        c: { d: 'd' }
      }

      target = {}
    })

    it('should traverse schema and source objects', () => {
      operation = sinon.spy()
      Initializer.traverse(schema, source, target, operation)
      operation.should.have.been.calledWith('a', schema.a, source, target)
      operation.should.have.been.calledWith('b', schema.b, source, target)
      operation.should.have.been.calledWith('d', schema.c.properties.d, source.c, {})
    })

    it('should operate on a target object', () => {
      Initializer.traverse(schema, source, target, (key, desc, source, target) => {
        target[key] = source[key]
      })
      target.a.should.equal('a')
      target.b.should.equal('b')
      target.c.d.should.equal('d')
    })
  })

  /**
   * Assign
   */
  describe('assign', () => {
    let key, descriptors, source, target, options

    beforeEach(() => {
      descriptors = {
        simple: {
          type: 'string'
        },
        empty: {
          type: 'string'
        },
        private: {
          type: 'string',
          private: true
        },
        deleted: {
          type: 'string'
        },
        exists: {
          type: 'string'
        },
        immutable: {
          type: 'string',
          immutable: true
        },
        setter: {
          type: 'string',
          set: function (data) { this.setter = `${data.setter}ter` }
        },
        default: {
          type: 'string',
          default: 'default'
        },
        defaultFn: {
          type: 'string',
          default: () => 'default'
        },
        after: {
          type: 'string',
          after: function (data) { this.setAfter = `${data.after} assignment` }
        },
        whitespace: {
          type: 'string'
        },
        whitespaces: {
          type: 'array'
        },
        trim: {
          type: 'string',
          trim: true
        },
        trims: {
          type: 'array',
          trim: true
        },
        leading: {
          type: 'string',
          trim: {
            leading: true
          }
        },
        leadings: {
          type: 'array',
          trim: {
            leading: true
          }
        },
        trailing: {
          type: 'string',
          trim: {
            trailing: true
          }
        },
        trailings: {
          type: 'array',
          trim: {
            trailing: true
          }
        }
      }

      source = {
        simple: 'simple',
        empty: '',
        deleted: 'deleted',
        private: 'private',
        immutable: 'immutable',
        setter: 'set',
        after: 'after',
        whitespace: '  no trim  ',
        whitespaces: [ '  no  ', '  trim  '],
        trim: '  trim  ',
        trims: ['  trim  ', '  trim  '],
        leading: '  leading  ',
        leadings: ['  leading  ', '  leading  '],
        trailing: '  trailing  ',
        trailings: ['  trailing  ', '  trailing  ']
      }

      target = {
        deleted: 'not deleted',
        exists: 'exists'
      }

      options = { $unset: [ 'deleted' ] }
    })

    it('should set a property on target from source', () => {
      assign('simple', descriptors.simple, source, target, options)
      target.simple.should.equal('simple')
    })

    it('should set an empty string on a target from source', () => {
      assign('empty', descriptors.empty, source, target, options)
      target.empty.should.equal('')
    })

    it('should remove target properties marked for deletion with $unset', () => {
      assign('deleted', descriptors.deleted, source, target, options)
      target.should.not.have.property('deleted')
    })

    it('should keep target properties not marked for deletion with $unset', () => {
      assign('exists', descriptors.exists, source, target, options)
      target.should.have.property('exists')
      target.exists.should.equal('exists')
    })

    it('should skip private properties by default', () => {
      assign('private', descriptors.private, source, target, options)
      expect(target.private).to.be.undefined
    })

    it('should optionally assign private properties', () => {
      assign('private', descriptors.private, source, target, { private: true })
      target.private.should.equal('private')
    })

    it.skip('should define immutable properties', () => {
      assign('immutable', descriptors.immutable, source, target, options)
      target.immutable = 'changed'
      target.immutable.should.equal('immutable')
    })

    it('should set a property from a setter method', () => {
      assign('setter', descriptors.setter, source, target, options)
      target.setter.should.equal('setter')
    })

    it('should set a property from a default value', () => {
      assign('default', descriptors.default, source, target, options)
      target.default.should.equal('default')
    })

    it('should set a property from a default function', () => {
      assign('defaultFn', descriptors.defaultFn, source, target, options)
      target.defaultFn.should.equal('default')
    })

    it('should optionally skip default assignment', () => {
      assign('default', descriptors.default, source, target, { defaults: false })
      expect(target.default).to.be.undefined
    })

    it('should invoke an "after" method', () => {
      assign('after', descriptors.after, source, target, options)
      target.setAfter.should.equal('after assignment')
    })

    it('should not trim whitespace in a string by default', () => {
      assign('whitespace', descriptors.whitespace, source, target, options)
      target.whitespace.should.equal(source.whitespace)
    })

    it('should not trim whitespace in an array by default', () => {
      assign('whitespaces', descriptors.whitespaces, source, target, options)
      target.whitespaces.should.equal(source.whitespaces)
    })

    it('should trim both leading and trailing whitespace in a string', () => {
      assign('trim', descriptors.trim, source, target, options)
      target.trim.should.equal('trim')
    })

    it('should trim both leading and trailing whitespace in an array', () => {
      assign('trims', descriptors.trims, source, target, options)
      target.trims.should.eql(['trim', 'trim'])
    })

    it('should trim leading whitespace in a string', () => {
      assign('leading', descriptors.leading, source, target, options)
      target.leading.should.equal('leading  ')
    })

    it('should trim leading whitespace in an array', () => {
      assign('leadings', descriptors.leadings, source, target, options)
      target.leadings.should.eql(['leading  ', 'leading  '])
    })

    it('should trim trailing whitespace in a string', () => {
      assign('trailing', descriptors.trailing, source, target, options)
      target.trailing.should.equal('  trailing')
    })

    it('should trim trailing whitespace ', () => {
      assign('trailings', descriptors.trailings, source, target, options)
      target.trailings.should.eql(['  trailing', '  trailing'])
    })
  })

  describe('map', () => {
    let mapping, source, target

    beforeEach(() => {
      source = {
        a: 'a',
        b: { c: { d: 'e' } },
        f: 'f'
      }

      mapping = {
        'q': 'a',
        'r.s': 'b.c.d',
        'n': function (src) { return Object.keys(src).length }
      }

      target = {}
    })

    it('should assign properties to an object from a mapping', () => {
      map(mapping, source, target)
      target.q.should.equal('a')
      target.r.s.should.equal('e')
      target.n.should.equal(3)
    })

    it('should ignore properties of the source not defined in the mapping', () => {
      map(mapping, source, target)
      expect(target.f).to.be.undefined
    })
  })

  describe('project', () => {
    let mapping, source, target

    beforeEach(() => {
      source = {
        q: 1,
        r: { s: 2 }
      }

      mapping = {
        'q': 'a',
        'r.s': 'b.c.d',
        't': 'e.f'
      }

      target = {}
    })

    it('should project properties to an object from a mapping', () => {
      project(mapping, source, target)
      target.a.should.equal(1)
      target.b.c.d.should.equal(2)
    })

    it('should ignore properties of the source not defined in the mapping', () => {
      project(mapping, source, target)
      expect(target.t).to.be.undefined
    })
  })

  describe('select', () => {
    let properties, source, target

    beforeEach(() => {
      properties = [ 'a', 'b.c.d' ]

      source = {
        a: 'a',
        b: { c: { d: 'e' } },
        f: 'f'
      }

      target = {}
    })

    it('should assign a subset of a source object\'s properties to a target', () => {
      select(properties, source, target)
      target.a.should.equal('a')
      target.b.c.d.should.equal('e')
    })

    it('should ignore properties not defined in the properties', () => {
      select(properties, source, target)
      expect(target.f).to.be.undefined
    })
  })

  describe('getDeepProperty', () => {
    it('should read a value from nested source objects via chain', () => {
      getDeepProperty({ a: { b: { c: 'c' } } }, ['a', 'b', 'c']).should.equal('c')
    })

    it('should read an empty string', () => {
      getDeepProperty({ a: { b: { c: '' } } }, ['a', 'b', 'c']).should.equal('')
    })
  })

  describe('setDeepProperty', () => {
    it('should read a value from nested source objects via chain', () => {
      let target = {}
      setDeepProperty(target, ['a', 'c'], 'c')
      target.a.c.should.equal('c')
    })

    it('should ignore undefined values', () => {
      let target = { a: 'a', b: 'b' }
      setDeepProperty(target, ['a'], undefined)
      target.a.should.equal('a')
    })

    it('should set empty strings', () => {
      let target = { a: 'a' }
      setDeepProperty(target, ['a'], '')
      target.a.should.equal('')
    })
  })

  describe('initialize', () => {
    let schema, source, target, options

    beforeEach(() => {
      schema = {}
      target = {}
    })

    describe('with mapping option', () => {

      beforeEach(() => {
        options = {
          mapping: {}
        }

        sinon.spy(Initializer, 'map')
      })

      it('should map the source to the target', () => {
        Initializer.initialize(schema, source, target, options)
        Initializer.map.should.have.been.calledWith(options.mapping, {}, target)
      })

      after(() => {
        Initializer.map.restore()
      })
    })

    describe('with select option', () => {

      beforeEach(() => {
        options = {
          select: []
        }

        sinon.spy(Initializer, 'select')
      })

      it('should call select over the source object', () => {
        Initializer.initialize(schema, source, target, options)
        Initializer.select.should.have.been.calledWith(options.select, {}, target)
      })

      after(() => {
        Initializer.select.restore()
      })
    })

    describe('with no option', () => {

      beforeEach(() => {
        options = {}
        sinon.spy(Initializer, 'traverse')
      })

      it('should traverse the source object', () => {
        Initializer.initialize(schema, source, target, options)
        Initializer.traverse.should.have.been.calledWith(schema, {}, target, Initializer.assign, options)
      })

      after(() => {
        Initializer.traverse.restore()
      })

    })

  })

})
