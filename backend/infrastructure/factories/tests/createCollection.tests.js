/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { createCollection } from '../createCollection'
import { getCollection } from '../../../api/utils/getCollection'
import { getLocalCollection } from '../../../api/utils/getLocalCollection'

describe(createCollection.name, function () {
  it('creates a new collection', function () {
    const name = Random.id()
    const collection = createCollection({
      name,
      schema: { foo: String }
    })
    expect(() => collection.insert({})).to.throw('Foo is required')
    expect(getCollection(name)).to.equal(collection)
    expect(getLocalCollection(name)).to.equal(undefined)
  })
  it('creates a new local collection', function () {
    const name = Random.id()
    const collection = createCollection({
      name,
      isLocal: true,
      schema: { foo: String }
    })
    expect(() => collection.insert({})).to.throw('Foo is required')
    expect(getCollection(name)).to.equal(undefined)
    expect(getLocalCollection(name)).to.equal(collection)
  })
  it('does not creates a new local collection if there is already one', function () {
    const name = Random.id()
    const collection = createCollection({
      name,
      isLocal: true,
      schema: { foo: String }
    })
    expect(createCollection({
      name,
      isLocal: true,
      schema: { foo: String }
    }))
      .to.equal(collection)
  })
})
