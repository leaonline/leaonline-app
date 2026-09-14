/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { createCollection } from '../createCollection'
import { getCollection } from '../../../api/utils/getCollection'
import { getLocalCollection } from '../../../api/utils/getLocalCollection'
import { expectThrown } from '../../../tests/helpers/expectThrown'

describe(createCollection.name, function () {
  it('creates a new collection', async () => {
    const name = Random.id()
    const collection = createCollection({
      name,
      schema: { foo: String }
    })
    expect(getCollection(name)).to.equal(collection)
    expect(getLocalCollection(name)).to.equal(undefined)
    await expectThrown({
      fn: () => collection.insert({}),
      message: 'Foo is required'
    })
  })
  it('creates a new local collection', async () => {
    const name = Random.id()
    const collection = createCollection({
      name,
      isLocal: true,
      schema: { foo: String }
    })
    expect(getCollection(name)).to.equal(undefined)
    expect(getLocalCollection(name)).to.equal(collection)
    await expectThrown({
      fn: () => collection.insert({}),
      message: 'Foo is required'
    })
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
