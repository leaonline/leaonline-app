import { createContextStorage } from '../../lib/contexts/createContextStorage'
import { simpleRandom } from '../../__testHelpers__/simpleRandom'
import AsyncStorage from '../../__mocks__/@react-native-async-storage/async-storage'
import Meteor from '@meteorrn/core'
import { addCollection } from '../../lib/infrastructure/collections/collections'

const createCtx = () => {
  const name = simpleRandom()
  const c = new Meteor.Collection(null)
  addCollection(name, c)
  const collection = () => c
  return { name, collection }
}

const createData = () => [
  { _id: simpleRandom(), _version: 1, foo: 'bar' },
  { _id: simpleRandom(), _version: 1, bar: 'moo' }
].sort()

describe(createContextStorage.name, function () {
  beforeAll(() => {
    jest.useFakeTimers({ advanceTimers: true })
  })
  it('creates a new storage instance', () => {
    const ctx = createCtx()
    const storage = createContextStorage(ctx)
    expect(storage.name).toBe(ctx.name)
  })

  it('loads data from storage into collection', async () => {
    const data = createData()
    AsyncStorage.getItem.mockReturnValueOnce(Meteor.EJSON.stringify(data))
    const ctx = createCtx()
    const storage = createContextStorage(ctx)
    await storage.loadIntoCollection()
    const docs = ctx.collection().find().fetch()
    expect(docs.length).toEqual(data.length)

    data.forEach(doc => {
      expect(ctx.collection().findOne(doc._id)).toEqual(doc)
    })
  })

  it('saves data from collection to storage', async () => {
    const data = createData()
    const ctx = createCtx()
    data.forEach(doc => ctx.collection().insert(doc))
    const storage = createContextStorage(ctx)
    await storage.saveFromCollection()

    const loaded = await AsyncStorage.getItem(storage.key)
    const docs = Meteor.EJSON.parse(loaded)
    expect(docs.length).toEqual(data.length)
    docs.forEach(doc => {
      const found = data.find(element => element._id === doc._id)
      expect(found).toEqual(doc)
    })
  })
})
