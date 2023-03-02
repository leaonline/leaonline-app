import Meteor from '@meteorrn/core'
import { Sync } from '../../lib/infrastructure/sync/Sync'
import { simpleRandom } from '../../__testHelpers__/simpleRandom'
import AsyncStorage from '../../__mocks__/@react-native-async-storage/async-storage'
import { addCollection } from '../../lib/infrastructure/collections/collections'
import { restoreAll, stub, overrideStub } from '../../__testHelpers__/stub'
import { createContextStorage } from '../../lib/contexts/createContextStorage'
import { cleanup } from '@testing-library/react-native'
import { ContextRepository } from '../../lib/infrastructure/ContextRepository'

describe(Sync.name, function () {
  beforeAll(() => {
    try {
      const coll = Sync.collection()
      addCollection(Sync.name, coll)
    }
    catch (e) {
      const c = new Meteor.Collection(null)
      Sync.collection = () => c
      addCollection(Sync.name, c)
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
      await expect(Sync.run({ onProgress }))
        .rejects.toThrow(expected)
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
      stub(Meteor, 'status', () => ({ connected: true }))
      stub(Meteor, 'call', (name, doc, callback) => callback(null, data))

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
      stub(Meteor, 'status', () => ({ connected: true }))
      stub(Meteor, 'call', (name, doc, callback) => callback(null, data))
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
      collection = new Meteor.Collection(null)
      storage = createContextStorage({ name })
    })

    it('does not sync if no docs were returned from server', async () => {
      stub(Meteor, 'status', () => ({ connected: true }))
      stub(Meteor, 'call', (name, doc, callback) => callback(null, null))

      expect(await Sync.syncContext({ name, collection, storage }))
        .toBe(false)
    })

    it('syncs a given context with the server', async () => {
      const docs = [
        { _id: simpleRandom(), _version: 1, foo: 'bar' },
        { _id: simpleRandom(), _version: 1, bar: 'moo' }
      ]

      stub(Meteor, 'status', () => ({ connected: true }))
      stub(Meteor, 'call', (name, doc, callback) => callback(null, docs))
      stub(storage, 'saveFromCollection', () => {})

      const synced = await Sync.syncContext({ name, collection, storage })
      expect(synced).toBe(true)

      expect(collection.find().count()).toBe(2)
      docs.forEach(doc => {
        expect(collection.findOne(doc._id)).toEqual(doc)
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
      const c = new Meteor.Collection(null)
      addCollection(name, c)

      Sync.collection().remove({})
      Sync.collection().insert({})

      const data = {
        [name]: {
          updatedAt: new Date(),
          hash: simpleRandom()
        }
      }
      stub(Meteor, 'status', () => ({ connected: true }))
      stub(Meteor, 'call', (name, doc, callback) => callback(null, data))

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
      overrideStub(Meteor, 'call', (name, doc, callback) => callback(null, newDocs))
      let progress = 0

      const onProgress = (data) => {
        progress = data.progress
      }

      // should throw if no ctx found
      await expect(() => Sync.run({ onProgress }))
        .rejects.toThrow(`Expected ctx for key ${name}`)

      // make ctx to be found
      ContextRepository.add(name, { name, collection: () => c, storage })

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
      expect(c.find().count()).toBe(newDocs.length)
      newDocs.forEach(doc => {
        expect(c.findOne(doc._id)).toEqual(doc)
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
