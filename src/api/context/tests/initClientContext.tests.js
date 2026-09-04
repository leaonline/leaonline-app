/* eslint-env mocha */
import { Mongo } from 'meteor/mongo'
import { initClientContext } from '../initClientContext'
import { stub, restoreAll } from '../../../../tests/helpers.tests'
import { Random } from 'meteor/random'
import { expect } from 'chai'
import Collection2 from 'meteor/aldeed:collection2'

const debug = () => {}

describe(initClientContext.name, function () {
  afterEach(function () {
    restoreAll()
  })

  // XXX: backwards compat for pre 4.0 collection2
  if (Collection2 && typeof Collection2.load === 'function') {
    it('loads collection2 lazy', function () {
      let loadCalled = false
      stub(Collection2, 'load', function () {
        loadCalled = true
      })

      initClientContext({
        name: Random.id(),
        schema: { title: String }
      }, debug)

      expect(loadCalled).to.equal(true)
    })
  }

  it('creates a new collection', function () {
    const ctx = {
      name: Random.id(),
      schema: { title: String }
    }

    const build = initClientContext(ctx, debug)
    expect(build).to.equal(ctx)

    expect(ctx.collection()).to.be.instanceOf(Mongo.Collection)
    const collection = Mongo.getCollection(ctx.name)
    expect(ctx.collection()).to.equal(collection)

    // skip second creation
    expect(initClientContext(ctx)).to.deep.equal(ctx)
  })
  it('has schema attached', function () {
    const ctx = {
      name: Random.id(),
      schema: { title: String }
    }

    initClientContext(ctx, debug)
    const collection = ctx.collection()
    expect(collection.attachSchema).to.be.a('function')
    expect(() => collection.insert({ name: 'foo' }))
      .to.throw('After filtering out keys not in the schema, your object is now empty')
  })
})
