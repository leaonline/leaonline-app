/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { Users } from '../Users'
import { Accounts } from 'meteor/accounts-base'
import { testGetAllMethod, testRemove } from '../../../tests/helpers/backendMethods'
import { getUsersCollection } from '../../../api/collections/getUsersCollection'
import { setupAndTeardown } from '../../../tests/helpers/setupAndTeardown'
import { stub } from '../../../tests/helpers/stubUtils'
import { RestoreCodes } from '../../../api/accounts/RestoreCodes'
import { expectThrown } from '../../../tests/helpers/expectThrown'
import { iterateAsync } from '../../../tests/helpers/iterate'
import { coin } from '../../../tests/helpers/coin'
import { forEachAsync } from '../../../infrastructure/async/forEachAsync'

const createUser = (options = {}) => {
  const doc = {
    username: options.username ?? Random.id(),
    createdAt: options.createdAt ?? new Date(),
    restore: options.restore ?? Random.id(),
    voice: options.voice ?? Random.id(),
    speed: options.speed ?? 1
  }

  if (options.lastLogin) {
    doc.lastLogin = options.lastLogin
  }

  return doc
}

const UsersCollection = getUsersCollection()

describe('Users', function () {
  setupAndTeardown([UsersCollection])

  describe('methods', function () {
    describe(Users.methods.create.name, () => {
      const run = Users.methods.create.run

      it('throws if there is a userId', async () => {
        const userId = Random.id()
        stub(RestoreCodes, 'generate', expect.fail)
        await expectThrown({
          fn: () => run.call({ userId }),
          name: createUser.error,
          reason: 'createUser.alreadyExist',
          details: { userId }
        })
      })
      it('creates a new user and logs them in', async () => {
        let runLoginHandlersCalled = false
        let loginUserCalled = false
        stub(RestoreCodes, 'generate', () => ['foo', 'bar', 'baz', Random.id(4)])
        stub(Accounts, '_runLoginHandlers', (self, credentials) => {
          expect(credentials.user.username).to.be.a('string')
          expect(credentials.password).to.be.a('string')
          runLoginHandlersCalled = true
        })
        stub(Accounts, '_loginUser', (self, newUserId) => {
          loginUserCalled = true
          return newUserId
        })

        await iterateAsync(3, async () => {
          runLoginHandlersCalled = false
          loginUserCalled = false
          const voice = coin() ? 'de-DE-test' : undefined
          const speed = coin() ? 1.0 : undefined
          const isDev = coin()
          const device = coin() ? { vendor: 'foo' } : undefined
          const newUserId = await run.call({}, { voice, speed, isDev, device })
          const userDoc = await getUsersCollection().findOneAsync(newUserId)
          const { username, restore, createdAt, services, ...doc } = userDoc
          expect(doc).to.deep.equal({
            _id: newUserId, voice, speed, isDev, device
          })
          expect(createdAt).to.be.instanceOf(Date)
          expect(username).to.be.a('string')
          expect(restore.includes('foo-bar-baz-')).to.equal(true)
          expect(loginUserCalled).to.equal(true)
          expect(runLoginHandlersCalled).to.equal(true)
        })
      })
    })
    describe(Users.methods.updateProfile.name, function () {
      const run = Users.methods.updateProfile.run

      it('throws if there is nothing to update', async () => {
        const userId = Random.id()
        const env = { userId }
        const allOptions = [undefined, {}, { voice: undefined, speed: undefined }]
        await forEachAsync(allOptions, async options => {
          const { voice, speed } = (options ?? {})
          await expectThrown({
            fn: () => run.call(env, options),
            name: 'permissionDenied',
            reason: 'updateProfile.failed',
            details: { userId, voice, speed }
          })
        })
      })
      it('updates the profile accordingly', async () => {
        const allOptions = [
          { voice: 'foo' },
          { voice: 'foo', speed: 1 },
          { speed: 1 }
        ]
        await forEachAsync(allOptions, async options => {
          const userId = await UsersCollection.insertAsync({})
          const env = { userId }
          await run.call(env, options)
          const doc = await UsersCollection.findOneAsync(userId)
          expect(doc).to.deep.equal({
            _id: userId,
            ...options
          })
        })
      })
    })
    describe(Users.methods.getCodes.name, function () {
      const run = Users.methods.getCodes.run

      it('returns a user\'s restore codes', async () => {
        const restore = 'foo-bar-baz'
        const userId = await UsersCollection.insertAsync({ restore })
        expect(await run.call({ userId })).to.equal(restore)
      })
    })
    describe(Users.methods.restore.name, () => {
      const run = Users.methods.restore.run

      it('throws if there is no user by restore codes', async () => {
        const count = 0
        const allCodes = [
          [],
          ['foo'],
          ['foo', 'bar'],
          ['foo', 'bar', 'baz']
        ]
        await forEachAsync(allCodes, async codes => {
          const restore = codes.join('-')
          await expectThrown({
            fn: () => run.call({}, { codes }),
            name: 'permissionDenied',
            reason: 'restore.failed',
            details: { codes, restore, count }
          })
        })
      })
      it('restores a user by codes', async () => {
        const codes = ['foo', 'bar', 'baz']
        const restore = 'foo-bar-baz'
        const userId = await UsersCollection.insertAsync({ restore })

        stub(Accounts, '_loginUser', (self, _id) => _id)
        const actualId = await run.call({}, { codes })
        expect(actualId).to.equal(userId)
      })
      it('updates the voice and speed if any value is passed', async () => {
        stub(Accounts, '_loginUser', (self, _id) => _id)
        const allOptions = [
          { voice: 'foo' },
          { speed: 1 },
          { device: { vendor: 'foo' } }
        ]
        await forEachAsync(allOptions, async (options, index) => {
          const codes = ['foo', 'bar', 'baz', `${index}`]
          const restore = `foo-bar-baz-${index}`
          const userId = await UsersCollection.insertAsync({ restore })
          await run.call({}, { codes, ...options })
          expect(await UsersCollection.findOneAsync(userId)).to.deep.equal({
            _id: userId,
            restore,
            ...options
          })
        })
      })
    })
    testRemove(Users, {
      factory: createUser,
      expectSync: false,
      collection: UsersCollection
    })
    testGetAllMethod(Users, {
      factory: createUser,
      collection: UsersCollection
    })
  })
})
