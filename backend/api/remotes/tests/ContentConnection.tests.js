/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { ContentConnection } from '../content/ContentConnection'
import { restoreAll, stub } from '../../../tests/helpers/stubUtils'
import { expectAsyncError } from '../../../tests/helpers/expectAsyncError'
import { Unit } from '../../../contexts/content/Unit'
import { asyncTimeout } from '../../utils/asyncTimeout'

describe('ContentConnection', () => {
  afterEach(() => {
    restoreAll()
  })

  describe(ContentConnection.connect.name, function () {
    it('connects to a remote ddp server', async () => {
      const log = s => expect(s).to.be.a('string')
      const connection = { status: () => ({ status: 'connected' }) }
      stub(DDP, 'connect', (_url, _options) => {
        setTimeout(() => _options.onConnected(), 5)
        return connection
      })
      const conn = await ContentConnection.connect({ log })
      expect(conn).to.equal(undefined)
      expect(ContentConnection.isConnected()).to.equal(true)
    })
    it('throws if the remote rejects the connection', async () => {
      const err = new Error('expected error')
      stub(DDP, 'connect', (_url, _options) => {
        setTimeout(() => _options.onConnected(err), 5)
      })
      const e = await expectAsyncError(ContentConnection.connect())
      expect(e).to.equal(err)
      expect(ContentConnection.isConnected()).to.equal(false)
    })
  })
  describe(ContentConnection.get.name, function () {
    it('gets a single docs from a collection', async () => {
      const doc = { _id: Random.id() }
      const connection = {
        call (methodName, params, cb) {
          expect(methodName).to.equal(`${Unit.name}.methods.get`)
          const { token, ids } = params
          expect(token).to.be.a('string')
          expect(ids).to.deep.equal([doc._id])
          return cb(undefined, doc)
        }
      }
      stub(DDP, 'connect', (_url, _options) => {
        setTimeout(() => _options.onConnected(), 5)
        return connection
      })

      await ContentConnection.connect()
      await asyncTimeout(10)

      const received = await ContentConnection.get({
        name: Unit.name,
        params: { foo: 'bar' },
        ids: [doc._id]
      })
      expect(received).to.deep.equal(doc)
    })
    it('throw if the remote returned with an error', async () => {
      const err = new Error('expected error')
      const connection = {
        call (methodName, params, cb) {
          return cb(err)
        }
      }
      stub(DDP, 'connect', (_url, _options) => {
        setTimeout(() => _options.onConnected(), 5)
        return connection
      })

      await ContentConnection.connect()
      await asyncTimeout(10)

      const log = (s) => expect(s).to.be.a('string')
      const e = await ContentConnection.get({
        name: Unit.name,
        log,
        ids: [Random.id()]
      })
      expect(e).to.deep.equal([])
    })
    it('returns all docs from remote if given', async () => {
      const docs = [
        { _id: Random.id() },
        { _id: Random.id() }
      ]
      const connection = {
        call (methodName, params, cb) {
          expect(methodName).to.equal(`${Unit.name}.methods.getAll`)
          const { token, ids } = params
          expect(token).to.be.a('string')
          expect(ids).to.deep.equal(undefined)
          return cb(undefined, docs)
        }
      }
      stub(DDP, 'connect', (_url, _options) => {
        setTimeout(() => _options.onConnected(), 5)
        return connection
      })

      await ContentConnection.connect()
      await asyncTimeout(10)

      const received = await ContentConnection.get({
        name: Unit.name
      })
      expect(received).to.deep.equal(docs)
    })
  })
})
