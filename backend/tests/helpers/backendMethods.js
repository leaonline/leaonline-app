import { Random } from 'meteor/random'
import { getCollection } from '../../api/utils/getCollection'
import { expect } from 'chai'
import { stub, restoreAll } from './stubUtils'
import { SyncState } from '../../contexts/sync/SyncState'
import { randomIntInclusive } from './randomIntInclusive'
import { createDocs } from './createDocs'
import { iterate } from './iterate'

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
    afterEach(() => {
      restoreAll()
      getCollection(ctx.name).remove({})
    })
    it('inserts a single document and returns it\'s _id', () => {
      const testSync = stubSyncUpdate({ ctx, expectSync })
      const collection = getCollection(ctx.name)
      expect(collection.find().count()).to.equal(0)

      const n = randomIntInclusive(1, 10)
      for (let i = 0; i < n; i++) {
        const _id = Random.id()
        const insertDoc = factory()
        insertDoc._id = _id
        const docId = run(insertDoc)
        expect(docId).to.be.a('string')
        expect(docId).to.not.equal(_id)
      }

      expect(collection.find().count()).to.equal(n)
      testSync()
    })
  })
}

export const testUpdate = (ctx, { factory, expectSync = false}) => {
  const method = ctx.methods.update
  const run = method.run

  describe(method.name, function () {
    afterEach(() => {
      restoreAll()
      getCollection(ctx.name).remove({})
    })
    it('updates a single document', () => {
      const testSync = stubSyncUpdate({ ctx, expectSync })
      const collection = getCollection(ctx.name)
      expect(collection.find().count()).to.equal(0)

      const n = randomIntInclusive(1, 10)
      for (let i = 0; i < n; i++) {
        const { insertDoc, updateDoc } = factory()
        const docId = collection.insert(insertDoc)
        const beforeDoc = collection.findOne(docId)
        const updated = run({
          _id: docId,
          ...updateDoc
        })
        expect(updated).to.equal(1)
        const afterDoc = collection.findOne(docId)
        expect(beforeDoc._id).to.equal(afterDoc._id)
        expect(afterDoc).to.not.deep.equal(beforeDoc)
      }
      testSync()
    })
  })
}

export const testRemove = (ctx, { factory, expectSync = false, collection }) => {
  const method = ctx.methods.remove || ctx.methods.delete
  const run = method.run

  describe(method.name, function () {
    afterEach(() => {
      restoreAll()
      ;(collection ?? getCollection(ctx.name)).remove({})
    })
    it('removes a single doc by _id', () => {
      const testSync = stubSyncUpdate({ ctx, expectSync })
      const ctxCollection = collection ?? getCollection(ctx.name)
      expect(ctxCollection.find().count()).to.equal(0)

      const n = randomIntInclusive(1, 10)
      for (let i = 0; i < n; i++) {
        const docId = ctxCollection.insert(factory())
        const fakeId = Random.id()
        // expected fail
        expect(run({ _id: fakeId })).to.equal(0)
        expect(ctxCollection.find(docId).count()).to.equal(1)

        // expected success
        expect(run({ _id: docId })).to.equal(1)
        expect(ctxCollection.find(docId).count()).to.equal(0)
      }

      expect(ctxCollection.find().count()).to.equal(0)
      testSync()
    })
  })
}

export const testGetMethod = (ctx, customFns) => {
  const method = ctx.methods.get
  const run = method.run

  describe(method.name, function () {

    it('returns a single doc by _id', () => {
      const _id = Random.id()
      expect(run({ _id })).to.equal(undefined)

      const collection = getCollection(ctx.name)
      collection.insert({ _id })

      const doc = collection.findOne(_id)
      expect(doc).to.not.equal(undefined)
      expect(run({ _id })).to.deep.equal(doc)
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
  const removeAll = name => getCollection(name).remove({})
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
    afterEach(() => {
      restoreAll(ctx.name)
      if (hasDependencies) {
        depNames.forEach(removeAll)
      }
    })
    it('returns all docs without dependencies', () => {
      const emptyResult = run()
      expect(emptyResult[ctx.name]).to.deep.equal([])
      expectNoDeps(emptyResult)

      const collection = getCollection(ctx.name) ?? fallbackCollection
      const docs = createDocs({ collection, factory })

      iterate(3, () => {
        const docResult = run()
        expect(docResult[ctx.name]).to.deep.equal(docs)
        expectNoDeps(docResult)
      })
    })
    if (hasDependencies) {
      it('returns all docs with dependencies', () => {
        const emptyResult = run({ dependencies: depArgs })
        expect(emptyResult[ctx.name]).to.deep.equal([])
        expectNoDeps(emptyResult)

        depNames.forEach(name => {
          createDocs({
            collection: getCollection(name),
            factory: dependencies[name].factory
          })
        })

        const collection = getCollection(ctx.name) ?? fallbackCollection
        const docs = createDocs({ collection, factory: () => factory(true) })

        // build expected result
        const expectedResult = { [ctx.name]: docs }
        depNames.forEach(name => {
          const selector = dependencies[name].selector({ docs })
          expectedResult[name] = getCollection(name).find(selector).fetch()
        })

        // expect at least one dep doc found
        expect(depNames.some(name => expectedResult[name].length > 0)).to.equal(true)

        iterate(3, () => {
          const docResult = run({ dependencies: depArgs })
          expect(docResult[ctx.name]).to.deep.equal(docs)
          expect(docResult).to.deep.equal(expectedResult)
        })
      })
    }
  })
}