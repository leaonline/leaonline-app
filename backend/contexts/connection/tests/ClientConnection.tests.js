/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { ClientConnection } from '../ClientConnection'
import { testGetAllMethod } from '../../../tests/helpers/backendMethods'

describe(ClientConnection.name, function () {
  afterEach(async () => {
    await ClientConnection.collection().removeAsync({})
  })

  describe(ClientConnection.onConnected.name, function () {
    it('stores the new connection', done => {
      const id = Random.id()
      const clientAddress = '255.255.255.255'
      const httpHeaders = { foo: 'bar' }

      const onClose = async fn => {
        expect(fn).is.a('function')
        const { _id, timestamp, ...doc } = await ClientConnection.collection().findOneAsync()
        expect(_id).to.be.a('string')
        expect(timestamp).to.be.instanceOf(Date)
        expect(doc).to.deep.equal({
          id, clientAddress, httpHeaders
        })
        done()
      }
      ClientConnection.onConnected({
        id, clientAddress, httpHeaders, onClose
      }).catch(done)
    })
  })
  describe(ClientConnection.onDisconnect.name, function () {
    it('removes a connection doc from the collection', async () => {
      const id = Random.id()
      await ClientConnection.collection().insertAsync({ id })
      expect(await ClientConnection.collection().countDocuments({})).to.equal(1)

      // expect no change
      await ClientConnection.onDisconnect({ id: Random.id() })
      expect(await ClientConnection.collection().countDocuments({})).to.equal(1)

      await ClientConnection.onDisconnect({ id })
      expect(await ClientConnection.collection().countDocuments({})).to.equal(0)
    })
  })
  describe(ClientConnection.onLogin.name, function () {
    it('adds a user to an existing connection', async () => {
      const id = Random.id()
      const connection = { id }
      const user = { _id: Random.id() }
      await ClientConnection.collection().insertAsync({ id })
      await ClientConnection.onLogin({ connection, user })
      const { _id, timestamp, ...doc } = await ClientConnection.collection().findOneAsync()
      expect(doc).to.deep.equal({
        id,
        userId: user._id,
        isDev: false
      })
    })
  })
  describe('methods', function () {
    testGetAllMethod(ClientConnection, {
      factory: () => ({ id: Random.id(), userId: Random.id() }),
      collection: ClientConnection.collection()
    })
  })
})
