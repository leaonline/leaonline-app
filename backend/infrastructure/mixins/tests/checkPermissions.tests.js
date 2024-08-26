/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { checkPermissions } from '../checkPermissions'
import { restoreAll, stub } from '../../../tests/helpers/stubUtils'
import { expectThrown } from '../../../tests/helpers/expectThrown'

describe(checkPermissions.name, function () {
  let connection
  beforeEach(() => {
    connection = { id: Random.id() }
  })
  afterEach(() => {
    restoreAll()
  })
  it('skips checks if is public', () => {
    const options = {
      name: Random.id(),
      run: function run () {},
      isPublic: true
    }
    const wrapped = checkPermissions(options)
    expect(wrapped.run).to.equal(options.run)
  })
  it('throws if method/pub is not invoked by user', async () => {
    stub(Meteor, 'user', () => {})
    const wrapped = checkPermissions({})
    await expectThrown({
      fn: () => wrapped.run.call({ connection }),
      name: 'errors.permissionDenied',
      reason: 'errors.userNotExists',
      details: {
        userId: undefined,
        isPublic: undefined,
        backend: undefined,
        clientConnection: connection.id
      }
    })
  })
  it('throws if method/pub is backend-only but not invoked by backend user', async () => {
    const userId = Random.id()

    stub(Meteor.users, 'findOneAsync', async () => ({ _id: userId }))
    const wrapped = checkPermissions({ backend: true })
    await expectThrown({
      fn: () => wrapped.run.call({ userId, connection }),
      name: 'errors.permissionDenied',
      reason: 'errors.backendOnly',
      details: {
        userId,
        isPublic: undefined,
        backend: true,
        clientConnection: connection.id
      }
    })
  })
  it('runs the method if invoked by a user', async () => {
    const userId = Random.id()
    const wrapped = checkPermissions({ run: (name) => `${name} foo` })
    expect(await wrapped.run.call({ userId }, 'hello,')).to.equal('hello, foo')
  })
  it('runs the backend method if invoked by a backend user', async () => {
    const userId = Random.id()
    const lea = { id: Random.id(), accessToken: Random.id() }
    const user = ({ _id: userId, services: { lea } })
    stub(Meteor.users, 'findOneAsync', async () => user)

    const wrapped = checkPermissions({ backend: true, run: (name) => `${name} foo` })
    expect(await wrapped.run.call({ userId, connection }, 'hello,')).to.equal('hello, foo')
  })
})
