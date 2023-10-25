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
import { iterate } from '../../../tests/helpers/iterate'
import { coin } from '../../../tests/helpers/coin'

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

      it('throws if there is a userId', () => {
        const userId = Random.id()
        stub(RestoreCodes, 'generate', expect.fail)
        expectThrown({
          fn: () => run.call({ userId }),
          name: createUser.error,
          reason: 'createUser.alreadyExist',
          details: { userId }
        })
      })
      it('creates a new user and logs them in', () => {
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

        iterate(3, () => {
          runLoginHandlersCalled = false
          loginUserCalled = false
          const voice = coin() ? 'de-DE-test' : undefined
          const speed = coin() ? 1.0 : undefined
          const isDev = coin()
          const device = coin() ? { vendor: 'foo' } : undefined
          const newUserId = run({ voice, speed, isDev, device })
          const userDoc = getUsersCollection().findOne(newUserId)
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

      it('throws if there is nothing to update', () => {
        const userId = Random.id()
        const env = { userId }
        ;[undefined, {}, { voice: undefined, speed: undefined }]
          .forEach(options => {
            const { voice, speed } = (options ?? {})
            expectThrown({
              fn: () => run.call(env, options),
              name: 'permissionDenied',
              reason: 'updateProfile.failed',
              details: { userId, voice, speed }
            })
          })
      })
      it('updates the profile accordingly', () => {
        [
          { voice: 'foo' },
          { voice: 'foo', speed: 1 },
          { speed: 1 }
        ]
          .forEach(options => {
            const userId = UsersCollection.insert({})
            const env = { userId }
            run.call(env, options)
            const doc = UsersCollection.findOne(userId)
            expect(doc).to.deep.equal({
              _id: userId,
              ...options
            })
          })
      })
    })
    describe(Users.methods.getCodes.name, function () {
      const run = Users.methods.getCodes.run

      it('returns a user\'s restore codes', () => {
        const restore = 'foo-bar-baz'
        const userId = UsersCollection.insert({ restore })
        expect(run.call({ userId }))
          .to.equal(restore)
      })
    })
    describe(Users.methods.restore.name, () => {
      const run = Users.methods.restore.run

      it('throws if there is no user by restore codes', () => {
        const count = 0
        ;[
          [],
          ['foo'],
          ['foo', 'bar'],
          ['foo', 'bar', 'baz']
        ].forEach(codes => {
          const restore = codes.join('-')
          expectThrown({
            fn: () => run({ codes }),
            name: 'permissionDenied',
            reason: 'restore.failed',
            details: { codes, restore, count }
          })
        })
      })
      it('restores a user by codes', () => {
        const codes = ['foo', 'bar', 'baz']
        const restore = 'foo-bar-baz'
        const userId = UsersCollection.insert({ restore })

        stub(Accounts, '_loginUser', (self, _id) => _id)
        const actualId = run({ codes })
        expect(actualId).to.equal(userId)
      })
      it('updates the voice and speed if any value is passed', () => {
        stub(Accounts, '_loginUser', (self, _id) => _id)
        ;[
          { voice: 'foo' },
          { speed: 1 },
          { device: { vendor: 'foo' } }
        ].forEach((options, index) => {
          const codes = ['foo', 'bar', 'baz', `${index}`]
          const restore = `foo-bar-baz-${index}`
          const userId = UsersCollection.insert({ restore })
          run({ codes, ...options })
          expect(UsersCollection.findOne(userId)).to.deep.equal({
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
