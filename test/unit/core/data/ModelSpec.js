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
const Model = require(path.join(cwd, 'core', 'data', 'Model'))
const ValidationError = require(path.join(cwd, 'core', 'data', 'validator'))
  .ValidationError

/**
 * Tests
 */
describe('Model', () => {
  class Example extends Model {

    // schema
    static get schema () {
      return {
        q: {
          type: 'string'
        },
        r: {
          type: 'boolean',
          default: true
        },
        s: {
          properties: {
            t: { type: 'string' },
            u: { type: 'boolean', default: true }
          }
        },
        v: {
          type: 'string',
          default: () => 'generated'
        },
        w: {
          type: 'string',
          private: true
        },
        short: {
          type: 'string',
          maxLength: 6
        },
        indirect: {
          type: 'string',
          set: function (data) { this.indirect = `indirect${data.indirect}` },
          after: function (data) { this.after = `after${this.indirect}` }
        },
        immutable: {
          type: 'string',
          immutable: true
        }
      }
    }

    // mappings
    static get mappings () {
      return {
        named: {
          'q': 'n',
          's.t': 'm.s.t'
        }
      }
    }

  }

  describe('initialize (static)', () => {
    describe('without data', () => {
      it('should provide an instance of the model', () => {
        let instance = Example.initialize()
        expect(instance).to.be.instanceof(Example)
      })
    })

    describe('with nullify option and no data', () => {
      it('should provide null if data is undefined', () => {
        let instance = Example.initialize(undefined, { nullify: true })
        expect(instance).to.be.null
      })

      it('should provide null if data is null', () => {
        let instance = Example.initialize(null, { nullify: true })
        expect(instance).to.be.null
      })
    })

    describe('with object data', () => {
      it('should provide an instance of the model', () => {
        let instance = Example.initialize({ q: 'qwerty' })
        expect(instance).to.be.instanceof(Example)
        instance.q.should.equal('qwerty')
      })
    })

    describe('with array data', () => {
      it.skip('should provide an array of model instances', () => {
        Example.initialize([
          {q:'first'},
          {q:'second'},
          {q:'third'}
        ]).forEach(instance => {
          expect(instance).to.be.instanceof(Example)
        })
      })
    })

    describe('with JSON object data', () => {
      it('should provide an instance of the model', () => {
        let instance = Example.initialize('{ "q": "qwerty" }')
        expect(instance).to.be.instanceof(Example)
        instance.q.should.equal('qwerty')
      })
    })

    describe('with JSON array data', () => {
      it.skip('should provide a ModelCollection of model instances', () => {
        let collection = Example.initialize('[' +
          '{ "q": "first" },' +
          '{ "q": "second" },' +
          '{ "q": "third" }' +
        ']')
        expect(collection).to.be.an('array')
        expect(collection.__model).to.equal(Example)
        collection.forEach(instance => {
          expect(instance).to.be.instanceof(Example)
        })
      })
    })

    describe('with array of JSON object data', () => {
      it.skip('should provide a ModelCollection of model instances', () => {
        let collection = Example.initialize([
          '{ "q": "first" }',
          '{ "q": "second" }',
          '{ "q": "third" }'
        ])
        expect(collection).to.be.an('array')
        expect(collection.__model).to.equal(Example)
        collection.forEach(instance => {
          expect(instance).to.be.instanceof(Example)
        })
      })
    })

    describe('with array and "first" option', () => {
      it('should return the first instance', () => {
        let instance = Example.initialize([{}, {}, {}], { first: true })
        Array.isArray(instance).should.be.false
        expect(instance).to.be.instanceof(Example)
      })
    })
  })

  describe('initialize (instance)', () => {
    describe('without data', () => {
      it('should set defaults defined by value', () => {
        let instance = new Example()
        instance.r.should.be.true
        instance.s.u.should.be.true
      })

      it('should set defaults defined by function', () => {
        let instance = new Example()
        instance.v.should.equal('generated')
      })
    })

    describe('with data', () => {
      it('should set properties defined in the schema', () => {
        let instance = new Example({ q: 'q', s: { t: 't' } })
        instance.q.should.equal('q')
        instance.s.t.should.equal('t')
      })

      it('should ignore properties not defined in the schema', () => {
        let instance = new Example({ hacker: 'p0wn3d' })
        expect(instance.hacker).to.be.undefined
      })

      it('should set defaults defined by value', () => {
        let instance = new Example({ q : 'q' })
        instance.r.should.be.true
        instance.s.u.should.be.true
      })

      it('should set defaults defined by function', () => {
        let instance = new Example({ q: 'q' })
        instance.v.should.equal('generated')
      })

      it('should invoke setter', () => {
        let instance = new Example({ indirect: 'value' })
        instance.indirect.should.equal('indirectvalue')
      })

      it('should invoke after', () => {
        let instance = new Example({ indirect: 'value' })
        instance.after.should.equal('afterindirectvalue')

      })

      it('should override default properties with provided data', () => {
        let instance = new Example({ r: false })
        instance.r.should.be.false
      })

      it('should skip private values by default', () => {
        let instance = new Example({ w: 'secret' })
        expect(instance.w).to.be.undefined
      })

      it.skip('should set immutable values', () => {
        let instance = new Example({ immutable: 'cannot change' })
        instance.immutable = 'changed'
        instance.immutable.should.equal('cannot change')
      })
    })

    describe('with $unset operator', () => {
      it.skip('should delete specified properties', () => {
        let instance = new Example({ q: 'not deleted' })
        instance.should.have.property('q')
        instance.q.should.equal('not deleted')
        instance.merge({ }, { $unset: [ 'q' ] })
        instance.should.not.have.property('q')
      })
    })

    describe('with private values option', () => {
      it('should set private values', () => {
        let instance = new Example({ w: 'secret' }, { private: true })
        instance.w.should.equal('secret')
      })
    })

    describe('with mapping option', () => {
      let data, mapping

      before(() => {
        data = {
          n: 'q',
          m: { s: { t: 't' } },
          hacker: 'p0wned'
        }

        mapping = {
          'q': 'n',
          's.t': 'm.s.t'
        }
      })

      it('should initialize an object from a literal mapping', () => {
        let instance = new Example(data, { mapping })
        instance.q.should.equal('q')
        instance.s.t.should.equal('t')
      })

      it.skip('should initialize an object from a named mapping', () => {
        let instance = new Example({ data, mapping: 'named' })
        instance.q.should.equal('q')
        instance.s.t.should.equal('t')
      })

      it('should ignore properties not defined in the map', () => {
        let instance = new Example(data, { mapping })
        expect(instance.hacker).to.be.undefined
      })
    })

    describe('with select option', () => {
      let instance

      before(() => {
        instance = new Example({
          q: 'q',
          r: true,
          v: 'generated'
        }, {
          select: ['r','v']
        })
      })

      it('should initialize a subset of an object\'s properties', () => {
        instance.r.should.be.true
        instance.v.should.equal('generated')
      })

      it('should ignore properties not defined in the selection', () => {
        expect(instance.q).to.be.undefined
      })

      it.skip('should generate default values if selected', () => {})
    })

    describe('without default values', () => {
      it('should not initialize default values', () => {
        let instance = new Example({}, { defaults: false })
        expect(instance.r).to.be.undefined
        expect(instance.s.u).to.be.undefined
        expect(instance.v).to.be.undefined
      })
    })
  })

  describe('validate (static)', () => {
    describe('with valid data', () => {
      it('should be valid', () => {
        Example.validate({ short: 'short' }).valid.should.be.true
      })
    })

    describe('with invalid data', () => {
      let validation

      before(() => {
        validation = Example.validate({ short: 'tooLong' })
      })

      it('should not be valid', () => {
        validation.valid.should.be.false
      })

      it('should return a ValidationError', () => {
        expect(validation).to.be.instanceof(ValidationError)
      })
    })
  })

  describe('validate (instance)', () => {
    describe('with valid data', () => {
      it('should be valid', () => {
        let instance = new Example({ short: 'short' })
        instance.validate().valid.should.be.true
      })
    })

    describe('with invalid data', () => {
      let instance, validation

      before(() => {
        instance = new Example({ short: 'tooLong' })
        validation = instance.validate()
      })

      it('should not be valid', () => {
        validation.valid.should.be.false
      })

      it('should return a ValidationError', () => {
        expect(validation).to.be.instanceof(ValidationError)
      })
    })
  })

  describe('map (static)', () => {})

  describe('project (static)', () => {})

  describe('project (instance)', () => {
    let instance, mapping, data

    before(() => {
      instance = new Example({ q: 'q', s: { t: 't' }})
      mapping = { 'q': 'n', 's.t': 'm.s.t' }
      data = instance.project(mapping)
    })

    it.skip('should initialize a new object from a literal mapping', () => {
      data.n.should.equal('q')
      data.m.s.t.should.equal('t')
    })

    it.skip('should initialize a new object from a named mapping', () => {
      data = instance.project('named')
      data.n.should.equal('q')
      data.m.s.t.should.equal('t')
    })
  })

  describe('select (static)', () => {})

  describe('merge (instance)', () => {})


  describe('serialize', () => {
    it('should generate JSON', () => {
      Model.serialize({ foo: 'bar' }).should.equal(JSON.stringify({ foo: 'bar' }))
    })
  })

  describe('deserialize', () => {
    it('should parse JSON', () => {
      Model.deserialize('{ "foo": "bar" }').foo.should.equal('bar')
    })

    it('should catch parsing errors', () => {
      expect(() => Model.deserialize('{badjson}')).to.throw(Error)
    })
  })

})
