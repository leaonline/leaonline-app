/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { SyncState } from '../SyncState'
import {
  restoreCollections,
  stubCollection
} from '../../../tests/helpers/stubCollection'
import { createCollection } from '../../../infrastructure/factories/createCollection'
import { asyncTimeout } from '../../../api/utils/asyncTimeout'
import { ContextRegistry } from '../../ContextRegistry'
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'
import { expectThrown } from '../../../tests/helpers/expectThrown'

const SyncCollection = createCollection(SyncState)

describe('SyncState', function () {
  setupAndTeardown([SyncCollection])

  describe(SyncState.update.name, function () {
    it('updates a sync state of a given name', async function () {
      const name = Random.id()
      const names = [name]
      const ctx = { name, sync: true }
      SyncState.register(ctx)
      ContextRegistry.add(name, ctx)
      expect(await SyncState.get({ names })).to.deep.equal([])

      await SyncState.update(name)

      const [{ _id, hash, updatedAt, version }] = await SyncState.get({ names })
      expect(_id).to.be.a('string')
      expect(hash).to.be.a('string')
      expect(version).to.equal(1)
      expect(updatedAt).to.be.instanceOf(Date)

      await asyncTimeout(50)
      await SyncState.update(name)

      const [updated] = await SyncState.get({ names })
      expect(updated._id).to.equal(_id)
      expect(updated.hash).to.not.equal(hash)
      expect(updated.version).to.equal(2)
      expect(updated.updatedAt.getTime()).to.be.above(updatedAt.getTime())
    })
  })
  describe(SyncState.validate.name, function () {
    it('throws if a ctx is not defined', function () {
      const name = Random.id()
      expect(() => SyncState.validate([name]))
        .to.throw(`Attempt to sync "${name}" but it's not defined for sync!`)
    })
    it('throws if a ctx is not registered for sync', function () {
      const name = Random.id()
      ContextRegistry.add(name, { name })
      expect(() => SyncState.validate([name]))
        .to.throw(`Attempt to sync "${name}" but it's not defined for sync!`)
    })
    it('validates a given ctx by name', function () {
      const name = Random.id()
      ContextRegistry.add(name, { name, sync: true })
    })
  })

  describe(SyncState.methods.getHashes.name, function () {
    it('returns the sync states for given names', async function () {
      const names = [Random.id(), Random.id()]
      names.forEach(name => {
        const ctx = { name, sync: true }
        SyncState.register(ctx)
        ContextRegistry.add(name, ctx)
        SyncState.update(name)
      })

      const method = SyncState.methods.getHashes.run
      const states = await method.call({}, { names })

      Object.values(states).forEach(state => {
        expect(names.includes(state.name)).to.equal(true)
        expect(state.version).to.be.above(0)
      })
    })
  })

  describe(SyncState.methods.getDocs.name, function () {
    const run = SyncState.methods.getDocs.run

    it('throws on invalid context', async function () {
      await expectThrown({
        fn: () => run.call({}, { name: 'foo' }),
        message: `Attempt to sync "foo" but it's not defined for sync!`
      })
    })
    it('throws on collection not exists', async function () {
      const ctx = { name: 'bar' , sync: true }
      SyncState.register(ctx)
      ContextRegistry.add(ctx.name, ctx)
      await expectThrown({
        fn: () => run.call({}, { name: 'bar' }),
        message: `No collection found for bar`
      })
    })
  })
})
