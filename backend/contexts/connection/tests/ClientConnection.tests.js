/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { ClientConnection } from '../ClientConnection'

describe(ClientConnection.name, function () {
  afterEach(() => {
    ClientConnection.collection().remove({})
  })

  describe(ClientConnection.onConnected.name, function () {
    it('stores the new connection', done => {
      const id = Random.id()
      const clientAddress = '255.255.255.255'
      const httpHeaders = { foo: 'bar' }

      const onClose = fn => {
        expect(fn).is.a('function')
        const { _id, timestamp, ...doc } = ClientConnection.collection().findOne()
        expect(_id).to.be.a('string')
        expect(timestamp).to.be.instanceOf(Date)
        expect(doc).to.deep.equal({
          id, clientAddress, httpHeaders
        })
        done()
      }
      ClientConnection.onConnected({
        id, clientAddress, httpHeaders, onClose
      })
    })
  })
  describe(ClientConnection.onDisconnect.name, function () {
    it('removes a connection doc from the collection', () => {
      const id = Random.id()
      ClientConnection.collection().insert({ id })
      expect(ClientConnection.collection().find().count()).to.equal(1)

      // expect no change
      ClientConnection.onDisconnect({ id: Random.id() })
      expect(ClientConnection.collection().find().count()).to.equal(1)

      ClientConnection.onDisconnect({ id })
      expect(ClientConnection.collection().find().count()).to.equal(0)
    })
  })
  describe(ClientConnection.onLogin.name, function () {
    it('adds a user to an existing connection', () => {
      const id = Random.id()
      const connection = { id }
      const user = { _id: Random.id() }
      ClientConnection.collection().insert({ id })
      ClientConnection.onLogin({ connection, user })
      const { _id, timestamp, ...doc } = ClientConnection.collection().findOne()
      expect(doc).to.deep.equal({
        id,
        userId: user._id,
        isDev: false
      })
    })
  })
  describe('methods', function () {
    describe(ClientConnection.methods.getAll.name, function () {
      it('returns all docs', () => {
        for (let i = 0; i < 10; i++) {
          ClientConnection.collection().insert({ userId: Random.id() })
        }
        const userId = Random.id()
        const allDocs = ClientConnection.methods.getAll.run.call({ userId })
        expect(allDocs[ClientConnection.name].length).to.equal(ClientConnection.collection().find().count())
      })
    })
  })
})
