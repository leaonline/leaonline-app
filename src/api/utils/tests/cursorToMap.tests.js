/* eslint-env mocha */
import { expect } from 'chai'
import { cursorToMap } from '../cursorToMap'
import { Random } from 'meteor/random'
import { Mongo } from 'meteor/mongo'
import { forEachAsync } from '../../../infrastructure/async/forEachAsync'

describe(cursorToMap.name, function () {
  it('creates a map of all docs', async () => {
    const collection = new Mongo.Collection(null)
    const docs = [
      { foo: 'bar' },
      { bar: 'baz' },
      { baz: 'moo' }
    ]
    await forEachAsync(docs, doc => collection.insertAsync(doc))

    const allDocs = await collection.find().fetchAsync()
    const map = await cursorToMap(collection.find())
    expect(allDocs.length).to.equal(map.size)
    allDocs.forEach((doc) => {
      expect(map.get(doc._id)).to.deep.equal(doc)
    })
    expect(map.get(Random.id(6))).to.equal(undefined)
  })
})
