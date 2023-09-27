/* eslint-env mocha */
import { expect } from 'chai'
import { DDP } from 'meteor/ddp'
import { Random } from 'meteor/random'
import { stub, restoreAll } from '../../../tests/helpers/stubUtils'
import { expectAsyncError } from '../../../tests/helpers/expectAsyncError'
import { stubCollection, restoreCollections } from '../../../tests/helpers/stubCollection'
import { ContentServer } from '../content/ContentServer'

import { Unit } from '../../../contexts/content/Unit'
import { UnitSet } from 'meteor/leaonline:corelib/contexts/UnitSet'
import { Field } from '../../../contexts/content/Field'
import { Dimension } from '../../../contexts/content/Dimension'
import { Level } from '../../../contexts/content/Level'
import { TestCycle } from 'meteor/leaonline:corelib/contexts/TestCycle'
import { ContentConnection } from '../content/ContentConnection'
import { initTestCollection } from '../../../tests/helpers/initTestCollection'

const contexts = [Unit, UnitSet, Field, Dimension, Level, TestCycle]
const contextNames = contexts.map(ctx => ctx.name)

const UnitCollection = initTestCollection(Unit)

describe('ContentServer', function () {
  before(() => {
    stubCollection([UnitCollection])
  })
  after(() => {
    restoreCollections()
  })
  afterEach(() => {
    restoreAll()
    UnitCollection.remove({})
  })

  describe(ContentServer.contexts.name, function () {
    it('returns all registered contexts', () => {
      expect(ContentServer.contexts()).to.deep.equal(contexts)
    })
  })
  describe(ContentServer.init.name, function () {
    it('initializes a new content connection', async () => {
      let called = false
      stub(ContentConnection, 'connect', () => {
        called = true
      })
      const self = await ContentServer.init()
      expect(self).to.equal(ContentServer)
      expect(called).to.equal(true)
    })
  })
  describe(ContentServer.sync.name, function () {
    const stubInvocation = () => {
      stub(DDP._CurrentMethodInvocation, 'get', () => false)
      stub(DDP._CurrentPublicationInvocation, 'get', () => false)
    }
    const stubConnection = (value = true) => {
      stub(ContentConnection, 'isConnected', () => value)
    }
    it('throws if invoked within method', async () => {
      stub(DDP._CurrentMethodInvocation, 'get', () => true)
      const error = await expectAsyncError(ContentServer.sync())
      expect(error).to.be.instanceOf(Meteor.Error)
      expect(error.error).to.equal('contentServer.error')
      expect(error.reason).to.equal('methodOrPubInvocation')
      expect(error.details).to.equal(undefined)
    })
    it('throws if invoked within method', async () => {
      stub(DDP._CurrentPublicationInvocation, 'get', () => true)
      const error = await expectAsyncError(ContentServer.sync())
      expect(error).to.be.instanceOf(Meteor.Error)
      expect(error.error).to.equal('contentServer.error')
      expect(error.reason).to.equal('methodOrPubInvocation')
      expect(error.details).to.equal(undefined)
    })
    it('throws if not connected', async () => {
      stubInvocation()
      stubConnection(false)
      const error = await expectAsyncError(ContentServer.sync())
      expect(error).to.be.instanceOf(Meteor.Error)
      expect(error.error).to.equal('contentServer.error')
      expect(error.reason).to.equal('notConnected')
      expect(error.details).to.equal(undefined)
    })
    it('throws if context does not exist by name', async () => {
      stubInvocation()
      stubConnection()
      const names = [undefined, null, '', Random.id(), 'unit2']

      for (const name of names) {
        const error = await expectAsyncError(ContentServer.sync({ name }))
        expect(error).to.be.instanceOf(Meteor.Error)
        expect(error.error).to.equal('contentServer.error')
        expect(error.reason).to.equal('contextNotDefined')
        expect(error.details).to.deep.equal({ name })
      }
    })
    it('throws if collection does not exist', async () => {
      stubInvocation()
      stubConnection()
      stub(Mongo.Collection, 'get', () => null)

      for (const name of contextNames) {
        const error = await expectAsyncError(ContentServer.sync({ name }))
        expect(error).to.be.instanceOf(Meteor.Error)
        expect(error.error).to.equal('contentServer.error')
        expect(error.reason).to.equal('collectionNotFound')
        expect(error.details).to.deep.equal({ name })
      }
    })
    it('adds remote docs to a collection from the content server', async () => {
      const docs = [
        { _id: Random.id(), title: 'foo' },
        { _id: Random.id(), title: 'bar' },
      ]
      const insertDocs = { [Unit.name]: docs }
      stub(ContentConnection, 'get', () => (insertDocs))
      stubInvocation()
      stubConnection()
      const result = await ContentServer.sync({ name: Unit.name })
      expect(result).to.deep.equal({
        name: Unit.name,
        created: 2,
        updated: 0,
        removed: 0,
        skipped: 0
      })
      expect(UnitCollection.find().fetch()).to.deep.equal(docs)
    })
    it('updates existing docs with the ones from remote if their _id matches', async () => {
      const docs = [
        { _id: Random.id(), title: 'foo' },
        { _id: Random.id(), title: 'bar' },
      ]
      const updateDocs = { [Unit.name]: docs }
      stub(ContentConnection, 'get', () => (updateDocs))
      docs.forEach(doc => UnitCollection.insert(doc))
      expect(UnitCollection.find().fetch()).to.deep.equal(docs)

      stubInvocation()
      stubConnection()
      const result = await ContentServer.sync({ name: Unit.name, debug: true })
      expect(result).to.deep.equal({
        name: Unit.name,
        created: 0,
        updated: 2,
        removed: 0,
        skipped: 0
      })
      const cursor = UnitCollection.find()
      expect(cursor.count()).to.equal(2)
      expect(cursor.fetch()).to.deep.equal(docs)
    })
    it('removes docs which are not in the remote collection anymore', async () => {
      const docs = [
        { _id: Random.id(), title: 'foo' },
        { _id: Random.id(), title: 'bar' },
      ]

      const insertDoc = { _id: Random.id(), title: 'moo' }
      const removeDocs = {
        [Unit.name]: [insertDoc]
      }
      stub(ContentConnection, 'get', () => (removeDocs))
      docs.forEach(doc => UnitCollection.insert(doc))
      expect(UnitCollection.find().fetch()).to.deep.equal(docs)

      stubInvocation()
      stubConnection()
      const result = await ContentServer.sync({ name: Unit.name, debug: true })
      expect(result).to.deep.equal({
        name: Unit.name,
        created: 1,
        updated: 0,
        removed: 2,
        skipped: 0
      })
      const cursor = UnitCollection.find()
      expect(cursor.count()).to.equal(1)
      expect(cursor.fetch()).to.deep.equal([insertDoc])
    })
    it('skips docs marked as legacy', async () => {
      const docs = [
        { _id: Random.id(), title: 'foo' },
        { _id: Random.id(), title: 'bar', isLegacy: true },
      ]
      const insertDocs = { [Unit.name]: docs }
      stub(ContentConnection, 'get', () => (insertDocs))
      expect(UnitCollection.find().count()).to.deep.equal(0)

      stubInvocation()
      stubConnection()
      const result = await ContentServer.sync({ name: Unit.name, debug: true })
      expect(result).to.deep.equal({
        name: Unit.name,
        created: 1,
        updated: 0,
        removed: 0,
        skipped: 1
      })
      const cursor = UnitCollection.find()
      expect(cursor.count()).to.equal(1)
      expect(cursor.fetch()).to.deep.equal([docs[0]])
    })
    it('skips if no docs are to be synced', async () => {
      const docs = [
        { _id: Random.id(), title: 'foo' },
        { _id: Random.id(), title: 'bar' },
      ]
      const updateDocs = { [Unit.name]: docs }
      stub(ContentConnection, 'get', () => ({}))
      docs.forEach(doc => UnitCollection.insert(doc))
      expect(UnitCollection.find().fetch()).to.deep.equal(docs)

      stubInvocation()
      stubConnection()
      const result = await ContentServer.sync({ name: Unit.name, debug: true })
      expect(result).to.deep.equal({
        name: Unit.name,
        created: 0,
        updated: 0,
        removed: 0,
        skipped: 0
      })
      const cursor = UnitCollection.find()
      expect(cursor.count()).to.equal(2)
      expect(cursor.fetch()).to.deep.equal(docs)
    })
    it('allows to hook into beforeSyncUpsert', done => {
      const docs = [
        { _id: Random.id(), title: 'foo' },
      ]
      const insertDocs = { [Unit.name]: docs }
      stub(ContentConnection, 'get', () => (insertDocs))
      stubInvocation()
      stubConnection()

      const fn = ({ type, doc }) => {
        expect(type).to.equal('insert')
        expect(doc).to.deep.equal(docs[0])
        ContentServer.off(ContentServer.hooks.beforeSyncUpsert, Unit.name, fn)
        done()
      }
      ContentServer.on(ContentServer.hooks.beforeSyncUpsert, Unit.name, fn)

      ContentServer
        .sync({ name: Unit.name })
        .catch(done)
    })
    it('allows to hook into syncEnd', done => {
      const docs = [
        { _id: Random.id(), title: 'foo' },
      ]
      const insertDocs = { [Unit.name]: docs }
      stub(ContentConnection, 'get', () => (insertDocs))
      stubInvocation()
      stubConnection()

      const fn = (stats) => {
        expect(stats).to.deep.equal({
          name: Unit.name,
          created: 1,
          updated: 0,
          removed: 0,
          skipped: 0
        })
        ContentServer.off(ContentServer.hooks.syncEnd, Unit.name, fn)
        done()
      }
      ContentServer.on(ContentServer.hooks.syncEnd, Unit.name, fn)

      ContentServer
        .sync({ name: Unit.name })
        .catch(done)
    })
  })
})