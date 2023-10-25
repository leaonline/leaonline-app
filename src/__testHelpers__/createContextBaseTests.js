import { collectionExists, getCollection } from '../lib/infrastructure/collections/collections'
import { createCollection } from '../lib/infrastructure/createCollection'
import { simpleRandomHex } from '../lib/utils/simpleRandomHex'
import AsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'

export const createContextBaseTests = ({ ctx, custom }) => {
  const storageKey = `contexts-${ctx.name}`

  beforeAll(() => {
    jest.useFakeTimers({ advanceTimers: true })
  })

  if (ctx.collection) {
    describe(ctx.collection.name, () => {
      beforeAll(() => {
        if (!collectionExists(ctx.name)) {
          createCollection({
            name: ctx.name,
            isLocal: true
          })
        }
      })

      afterAll(() => {
        const collection = getCollection(ctx.name)
        ctx.collection = () => collection
      })

      it('throws if collection is not initiated', () => {
        expect(() => ctx.collection())
          .toThrow(`Collection ${ctx.name} not initialized`)
      })
    })
  }

  if (ctx.init) {
    describe(ctx.init.name, function () {
      it('loads sync docs into collection', async () => {
        const _id = simpleRandomHex()
        const doc = { _id, title: 'moo' }
        await AsyncStorage.setItem(storageKey, JSON.stringify(doc))
        await ctx.init()
        const collection = getCollection(ctx.name)
        expect(collection.findOne({ _id }))
          .toStrictEqual({ _version: 1, ...doc })
      })
    })
  }
  if (custom) {
    custom()
  }
}