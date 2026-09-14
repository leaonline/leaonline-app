import Meteor from '@meteorrn/core'
import { Sync } from '../../lib/infrastructure/sync/Sync'
import { simpleRandom } from '../../__testHelpers__/simpleRandom'
import { collectionExists } from '../../lib/infrastructure/collections/collections'
import { restoreAll, stub } from '../../__testHelpers__/stub'
import { createContextStorage } from '../../lib/contexts/createContextStorage'
import { cleanup } from '@testing-library/react-native'
import { ContextRepository } from '../../lib/infrastructure/ContextRepository'
import { createCollection } from '../../lib/infrastructure/createCollection'
import { mockCall } from '../../__testHelpers__/mockCall'
const AsyncStorage = require('../../__mocks__/@react-native-async-storage/async-storage')

describe(`${Sync.name}-system`, function () {
  beforeAll(() => {
    expect(() => Sync.collection())
      .toThrow(`Collection ${Sync.name} not initialized`)
    if (!collectionExists(Sync.name)) {
      const collection = createCollection({
        name: Sync.name,
        isLocal: true
      })
      Sync.collection = () => collection
    }
  })

  afterEach(() => {
    restoreAll()
    cleanup()
  })

  describe(Sync.init.name, function () {
    it('throws on other methods if Sync is not initialized', async () => {
      const expected = 'Sync.init must be called first'
      await expect(Sync.isRequired()).rejects.toThrow(expected)
      const onProgress = () => {}
      await expect(Sync.run({ onProgress })).rejects.toThrow(expected)
    })
    it('ensures there is a Sync doc', async () => {
      expect(Sync.collection().findOne()).toBe(undefined)
      await AsyncStorage.getItem.mockReturnValueOnce(null)
      await Sync.init()
      const { _id, _version, ...doc } = Sync.collection().findOne()
      expect(_id).toBeTruthy()
      expect(doc).toEqual({})
      Sync.collection().remove({})
    })
    it('loads the latest local sync doc from storage', async () => {
      const doc = { _id: simpleRandom(), _version: 1, foo: 'bar' }
      await AsyncStorage.getItem.mockReturnValueOnce(Meteor.EJSON.stringify(doc))
      await Sync.init()
      expect(Sync.collection().findOne()).toEqual(doc)
    })
  })

  describe(Sync.isRequired.name, function () {
    afterEach(() => {
      Sync.reset()
    })
    it('returns false if no context is required to be synced', async () => {
      const data = {}
      mockCall((name, doc, callback) => callback(null, data))

      const isRequired = await Sync.isRequired()
      expect(Sync.getQueue()).toEqual([])
      expect(isRequired).toBe(false)
    })
    it('returns true if a context is required to be synced', async () => {
      const data = {
        dimension: {
          updatedAt: new Date(),
          hash: simpleRandom()
        },
        foo: {
          updatedAt: new Date(),
          hash: simpleRandom()
        }
      }
      mockCall((name, doc, callback) => callback(null, data))
      stub(Sync.collection(), 'findOne', () => ({
        dimension: {
          updatedAt: new Date(),
          hash: simpleRandom() // outdated
        },
        foo: {
          updatedAt: data.foo.updatedAt,
          hash: data.foo.hash
        }
      }))
      const isRequired = await Sync.isRequired()
      expect(Sync.getQueue()).toEqual([{
        key: 'dimension',
        hash: data.dimension.hash,
        updatedAt: data.dimension.updatedAt
      }])
      expect(isRequired).toBe(true)
    })
  })

  describe(Sync.syncContext.name, () => {
    let name
    let collection
    let storage

    beforeAll(() => {
      name = simpleRandom()
      collection = createCollection({ name, isLocal: true })
      storage = createContextStorage({ name })
    })

    it('skips sync if no docs were returned from server', async () => {
      mockCall((name, doc, callback) => callback(null, null))

      expect(await Sync.syncContext({ name, collection, storage }))
        .toBe(false)
    })

    it('inserts received docs from server', async () => {
      const docs = [
        { _id: simpleRandom(), foo: 'bar' },
        { _id: simpleRandom(), bar: 'moo' }
      ]

      mockCall((name, doc, callback) => callback(null, docs))
      stub(storage, 'saveFromCollection', () => {})

      // existing docs are only updated
      await collection.insert({ ...docs[0], foo: 'moo' })
      await collection.insert({ _id: simpleRandom(), moo: 'milk' })

      const synced = await Sync.syncContext({ name, collection, storage })
      expect(synced).toBe(true)

      expect(collection.find().count()).toBe(2)
      expect(collection.findOne(docs[0]._id)).toStrictEqual({
        ...docs[0],
        _version: 2 // updated
      })
      expect(collection.findOne(docs[1]._id)).toStrictEqual({
        ...docs[1],
        _version: 1 // inserted
      })
    })
  })

  describe(Sync.run.name, function () {
    it('throws if there is no sync required', async () => {
      Sync.reset()
      const onProgress = () => {}
      await expect(Sync.run({ onProgress })).rejects.toThrow('Sync should not run if not required')
    })
    it('syncs the context and dispatches progress', async () => {
      const name = simpleRandom()
      const storage = createContextStorage({ name })
      const targetCollection = createCollection({ name, isLocal: true })

      Sync.collection().remove({})
      Sync.collection().insert({})

      const data = {
        [name]: {
          updatedAt: new Date(),
          hash: simpleRandom()
        }
      }

      mockCall((name, doc, callback) => callback(null, data))

      const isRequired = await Sync.isRequired()
      expect(Sync.getQueue()).toEqual([{
        key: name,
        hash: data[name].hash,
        updatedAt: data[name].updatedAt
      }])

      expect(isRequired).toBe(true)

      // run actual sync
      const newDocs = [
        { _id: simpleRandom(), _version: 1, foo: 'bar' },
        { _id: simpleRandom(), _version: 1, bar: 'moo' }
      ]

      stub(storage, 'saveFromCollection', () => {})

      // let backend return dimension docs
      mockCall((name, doc, callback) => callback(null, newDocs))
      let progress = 0

      const onProgress = (data) => {
        progress = data.progress
      }

      // should throw if no ctx found
      await expect(() => Sync.run({ onProgress }))
        .rejects.toThrow(`Expected ctx for key ${name}`)

      // make ctx to be found
      ContextRepository.add(name, { name, collection: () => targetCollection, storage })

      const updateSync = await Sync.run({ onProgress })
      expect(updateSync).toEqual({
        [name]: {
          hash: data[name].hash,
          updatedAt: data[name].updatedAt
        }
      })

      expect(await Sync.isRequired()).toBe(false)
      expect(progress).toEqual(1)
      expect(Sync.getQueue()).toEqual([])

      // docs in collection
      expect(targetCollection.find().count()).toBe(newDocs.length)
      newDocs.forEach(doc => {
        expect(targetCollection.findOne(doc._id)).toEqual(doc)
      })

      // sync updated
      const { _id, _version, ...updatedSyncDoc } = Sync.collection().findOne()
      expect(updatedSyncDoc).toEqual({
        [name]: {
          hash: data[name].hash,
          updatedAt: data[name].updatedAt
        }
      })
    })
  })
})
