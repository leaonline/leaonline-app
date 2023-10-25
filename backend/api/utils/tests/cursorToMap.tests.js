/* eslint-env mocha */
import { expect } from 'chai'
import { cursorToMap } from '../cursorToMap'
import { Random } from 'meteor/random'
import { Mongo } from 'meteor/mongo'

describe(cursorToMap.name, function () {
  it('creates a map of all docs', () => {
    const collection = new Mongo.Collection(null)
    ;[
      { foo: 'bar' },
      { bar: 'baz' },
      { baz: 'moo' }
    ].forEach(doc => collection.insert(doc))

    const allDocs = collection.find().fetch()
    const map = cursorToMap(collection.find())
    expect(allDocs.length).to.equal(map.size)
    allDocs.forEach((doc) => {
      expect(map.get(doc._id)).to.deep.equal(doc)
    })
    expect(map.get(Random.id(6))).to.equal(undefined)
  })
})
