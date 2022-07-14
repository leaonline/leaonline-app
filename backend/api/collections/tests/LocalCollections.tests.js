/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { LocalCollections } from '../LocalCollections'

describe('LocalCollections', function () {
  it('adds a new local collection', function () {
    const collection = new Mongo.Collection(null)
    const name = Random.id()
    LocalCollections.add(name, collection)
    expect(() => LocalCollections.add(name, collection))
      .to.throw(`Collection "${name}" already exists`)
    expect(LocalCollections.get(name)).to.equal(collection)
    expect(LocalCollections.get(Random.id())).to.equal(undefined)
  })
})
