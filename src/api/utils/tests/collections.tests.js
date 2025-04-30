/* eslint-env mocha */
import { getCollection } from '../getCollection'
import { Random } from 'meteor/random'
import { expect } from 'chai'
import { createCollection } from '../../../infrastructure/factories/createCollection'
import { getLocalCollection } from '../getLocalCollection'

describe(getCollection.name, function () {
  it('returns a collection if it exists', function () {
    const name = Random.id()
    const collection = createCollection({ name, schema: {} })
    expect(getCollection(name)).to.equal(collection)
    expect(getCollection(Random.id())).to.equal(undefined)
  })
})

describe(getLocalCollection.name, function () {
  it('returns a local collection', function () {
    const name = Random.id()
    const localName = Random.id()
    const collection = createCollection({ name, schema: {}, isLocal: false })
    const local = createCollection({ name: localName, schema: {}, isLocal: true })

    expect(getLocalCollection(localName)).to.equal(local)
    expect(getLocalCollection(Random.id())).to.equal(undefined)
    expect(getLocalCollection(collection)).to.equal(undefined)
    expect(getCollection(localName)).to.equal(undefined)
  })
})
