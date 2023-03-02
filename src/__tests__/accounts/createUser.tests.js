import { createUser } from '../../lib/meteor/createUser'
import Meteor from '@meteorrn/core'
import { MeteorLoginStorage } from '../../lib/meteor/MeteorLoginStorage'
import { stub, restoreAll, overrideStub } from '../../__testHelpers__/stub'

describe(createUser.name, () => {
  afterEach(() => {
    restoreAll()
  })

  it('throws on invalid args', async () => {
    try {
      await createUser({ email: 'foo', override: true })
    }
    catch (e) {
      expect(e.message).toMatch('email must be a valid email address')
    }

    try {
      await createUser({ email: 'foo@example.com', override: 'hello' })
    }
    catch (e) {
      expect(e.message).toMatch('override must be of type Boolean')
    }
  })

  it('returns the current user if such already exists', async () => {
    stub(Meteor, 'user', () => ({ _id: 'foo' }))
    expect(await createUser()).toEqual({ _id: 'foo' })
  })

  it('throws if not connected', async () => {
    stub(Meteor, 'user', () => null)
    stub(Meteor, 'status', () => ({ connected: false }))

    try {
      await createUser()
    }
    catch (e) {
      expect(e.message).toMatch('notConnected')
    }
  })

  it('throws if server responded with error', async () => {
    let storageUpdated = false
    stub(Meteor, 'user', () => null)
    stub(Meteor, 'status', () => ({ connected: true }))
    stub(MeteorLoginStorage, 'hasLogin', () => false)
    stub(Meteor, 'call', (name, args, cb) => {
      cb(new Error('foo-error from srv'))
    })
    stub(MeteorLoginStorage, 'setCredentials', () => {
      storageUpdated = true
    })

    let user
    try {
      user = await createUser()
    }
    catch (e) {
      expect(e.message).toMatch('foo-error from srv')
    }

    expect(user).toEqual(undefined)
    expect(storageUpdated).toEqual(false)
  })

  it('throws if the server responded with invalid data', async () => {
    let storageUpdated = false
    stub(Meteor, 'user', () => null)
    stub(Meteor, 'status', () => ({ connected: true }))
    stub(MeteorLoginStorage, 'hasLogin', () => false)
    stub(Meteor, 'call', (name, args, cb) => cb())
    stub(MeteorLoginStorage, 'setCredentials', () => {
      storageUpdated = true
    })

    let user

    // empty response but no error
    try {
      user = await createUser()
    }
    catch (e) {
      expect(e.message).toMatch('invalidResponse')
    }

    // empty object
    overrideStub(Meteor, 'call', (n, a, cb) => cb(undefined, {}))
    try {
      user = await createUser()
    }
    catch (e) {
      expect(e.message).toMatch('invalidResponse')
    }

    expect(user).toEqual(undefined)
    expect(storageUpdated).toEqual(false)
  })

  it('creates a new user', async () => {
    let storageUpdated = false
    const expectedUser = {
      _id: 'foo',
      username: 'john doe',
      createdAt: new Date(),
      restore: ['1234']
    }
    stub(Meteor, 'user', () => null)
    stub(Meteor, 'status', () => ({ connected: true }))
    stub(MeteorLoginStorage, 'hasLogin', () => false)
    stub(Meteor, 'call', (name, args, cb) => {
      cb(undefined, {
        user: expectedUser,
        password: '123456789012345678901234567890123'
      })
    })
    stub(MeteorLoginStorage, 'setCredentials', ({ username, password }) => {
      expect(username).toEqual('john doe')
      expect(password).toEqual('123456789012345678901234567890123')
      storageUpdated = true
    })

    const user = await createUser()
    expect(user).toEqual(expectedUser)
    expect(storageUpdated).toEqual(true)
  })

  it('returns null if no new user has been created', async () => {
    let storageUpdated = false
    let called = false
    const expectedUser = {
      _id: 'foo',
      username: 'john doe',
      createdAt: new Date(),
      restore: ['1234']
    }
    stub(Meteor, 'user', () => null)
    stub(Meteor, 'status', () => ({ connected: true }))
    stub(MeteorLoginStorage, 'hasLogin', () => true)
    stub(Meteor, 'call', (name, args, cb) => {
      cb(undefined, {
        user: expectedUser,
        password: '123456789012345678901234567890123'
      })
      called = true
    })
    stub(MeteorLoginStorage, 'setCredentials', ({ username, password }) => {
      expect(username).toEqual('john doe')
      expect(password).toEqual('123456789012345678901234567890123')
      storageUpdated = true
    })

    const user = await createUser()
    expect(user).toEqual(null)
    expect(storageUpdated).toEqual(false)
    expect(called).toEqual(false)

    // however: force-override
    const user2 = await createUser({ override: true })
    expect(user2).toEqual(expectedUser)
    expect(storageUpdated).toEqual(true)
    expect(called).toEqual(true)
  })
})
