/* eslint-env mocha */
import { Random } from 'meteor/random'
import { getCollection } from '../../api/utils/getCollection'
import { expect } from 'chai'
import { stub, restoreAll } from './stubUtils'
import { SyncState } from '../../contexts/sync/SyncState'
import { randomIntInclusive } from './randomIntInclusive'
import { createTestDocs } from './createTestDocs'
import { iterateAsync } from './iterate'
import { forEachAsync } from '../../infrastructure/async/forEachAsync'

const stubSyncUpdate = ({ ctx, expectSync }) => {
  let syncCalled = false
  const handler = expectSync
    ? name => { expect(name).to.equal(ctx.name); syncCalled = true }
    : expect.fail
  stub(SyncState, 'update', handler)

  return () => {
    if (expectSync) {
      expect(syncCalled).to.equal(true)
    }
  }
}

export const testInsert = (ctx, { factory, expectSync = false }) => {
  const method = ctx.methods.insert || ctx.methods.create
  const run = method.run

  describe(method.name, function () {
    afterEach(async () => {
      restoreAll()
      await getCollection(ctx.name).removeAsync({})
    })
    it('inserts a single document and returns it\'s _id', async () => {
      const testSync = stubSyncUpdate({ ctx, expectSync })
      const collection = getCollection(ctx.name)
      expect(await countDocs(collection)).to.equal(0)

      const n = randomIntInclusive(1, 10)
      for (let i = 0; i < n; i++) {
        const _id = Random.id()
        const insertDoc = await factory()
        insertDoc._id = _id
        const docId = await run(insertDoc)
        expect(docId).to.be.a('string')
        expect(docId).to.not.equal(_id)
      }

      expect(await countDocs(collection)).to.equal(n)
      await testSync()
    })
  })
}

export const testUpdate = (ctx, { factory, expectSync = false }) => {
  const method = ctx.methods.update
  const run = method.run

  describe(method.name, function () {
    afterEach(async () => {
      restoreAll()
      await getCollection(ctx.name).removeAsync({})
    })
    it('updates a single document', async () => {
      const testSync = stubSyncUpdate({ ctx, expectSync })
      const collection = getCollection(ctx.name)
      expect(await countDocs(collection)).to.equal(0)

      const n = randomIntInclusive(1, 10)
      for (let i = 0; i < n; i++) {
        const { insertDoc, updateDoc } = await factory()
        const docId = await collection.insertAsync(insertDoc)
        const beforeDoc = await collection.findOneAsync(docId)
        const updated = await run({
          _id: docId,
          ...updateDoc
        })
        expect(updated).to.equal(1)
        const afterDoc = await collection.findOneAsync(docId)
        expect(beforeDoc._id).to.equal(afterDoc._id)
        expect(afterDoc).to.not.deep.equal(beforeDoc)
      }
      await testSync()
    })
  })
}

export const testRemove = (ctx, { factory, expectSync = false, collection, env = {}, before = () => {} } = {}) => {
  const method = ctx.methods.remove || ctx.methods.delete
  const run = method.run

  describe(method.name, function () {
    beforeEach(async () => {
      await before() // setup stubs etc.
    })
    afterEach(async () => {
      restoreAll()
      await (collection ?? getCollection(ctx.name)).removeAsync({})
    })
    it('removes a single doc by _id', async () => {
      const testSync = stubSyncUpdate({ ctx, expectSync })
      const ctxCollection = collection ?? getCollection(ctx.name)
      expect(await countDocs(ctxCollection)).to.equal(0)

      await iterateAsync(10, async () => {
        const docId = await ctxCollection.insertAsync(await factory())
        const fakeId = Random.id()
        // expected fail
        // this could either be an error thrown or a 0 value being returned
        try {
          const removed = await run.call(env, { _id: fakeId })
          expect(removed).to.equal(0)
        } catch (e) {
          // all good here
        }

        expect(await countDocs(ctxCollection, { _id: docId })).to.equal(1)

        // expected success
        expect(await run.call(env, { _id: docId })).to.equal(1)
        expect(await countDocs(ctxCollection, { _id: docId })).to.equal(0)
      })

      expect(await countDocs(ctxCollection)).to.equal(0)
      await testSync()
    })
  })
}

export const testGetMethod = (ctx, customFns, { env = {}} = {}) => {
  const method = ctx.methods.get
  const run = method.run

  describe(method.name, function () {
    it('returns a single doc by _id', async () => {
      const _id = Random.id()
      expect(await run.call(env, { _id })).to.equal(undefined)

      const collection = getCollection(ctx.name)
      await collection.insertAsync({ _id })

      const doc = await collection.findOneAsync(_id)
      expect(doc).to.not.equal(undefined)
      expect(await run.call(env, { _id })).to.deep.equal(doc)
    })

    if (customFns) {
      customFns({
        run
      })
    }
  })
}

export const testGetAllMethod = (ctx, options) => {
  const { factory, dependencies = {} } = options
  const fallbackCollection = options.collection
  const method = ctx.methods.getAll ?? ctx.methods.all
  const run = method.run
  const depNames = Object.keys(dependencies)
  const depArgs = depNames.map(name => ({ name }))
  const hasDependencies = depNames.length > 0
  const removeAll = name => getCollection(name).removeAsync({})
  const expectNoDeps = (target) => {
    if (hasDependencies) {
      depNames.forEach(name => {
        // dependencies may or may not be included
        // however, if they are included, there should be no
        // docs if we have no docs of our main ctx
        if (name in target) {
          expect(target[name]).to.deep.equal([])
        }
      })
    }
  }

  describe(method.name, function () {
    afterEach(async () => {
      const collection = await getCollection(ctx.name)
      if (collection) collection.removeAsync({})
      restoreAll(ctx.name)
      if (hasDependencies) {
        for (const name of depNames) {
          await removeAll(name)
        }
      }
    })
    it('returns all docs without dependencies', async () => {
      const emptyResult = await run.call({})
      expect(emptyResult[ctx.name]).to.deep.equal([])
      expectNoDeps(emptyResult)

      const collection = getCollection(ctx.name) ?? fallbackCollection
      const docs = await createTestDocs({ collection, factory })
      expect(docs.length).to.be.above(0)

      // make sure all docs are in collection
      const ids = docs.map(doc => doc._id)
      expect(await collection.countDocuments({ _id: { $in: ids } })).to.equal(docs.length)

      await iterateAsync(3, async () => {
        const docResult = await run.call({})
        expect(docResult[ctx.name]).to.deep.equal(docs)
        expectNoDeps(docResult)
      })
    })
    if (hasDependencies) {
      it('returns all docs with dependencies', async () => {
        const emptyResult = await run.call({}, { dependencies: depArgs })
        expect(emptyResult[ctx.name]).to.deep.equal([])
        expectNoDeps(emptyResult)

        // create docs for dependencies
        for (const name of depNames) {
          await createTestDocs({
            collection: getCollection(name),
            factory: dependencies[name].factory,
            name
          })
        }

        const collection = getCollection(ctx.name) ?? fallbackCollection
        const docs = await createTestDocs({ collection, factory: async () => factory(true) })

        // build expected result
        const expectedResult = { [ctx.name]: docs }
        for (const name of depNames) {
          const selector = dependencies[name].selector({ docs })
          expectedResult[name] = await getCollection(name).find(selector).fetchAsync()
        }

        // expect at least one dep doc found
        expect(depNames.some(name => expectedResult[name].length > 0)).to.eq(true)

        const docResult = await run.call({}, { dependencies: depArgs })
        expect(docResult[ctx.name]).to.deep.equal(docs)
        expect(docResult).to.deep.equal(expectedResult)
      })
    }
  })
}

const countDocs = (c, q = {}) => c.countDocuments(q)