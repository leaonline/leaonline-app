/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { checkPermissions } from '../checkPermissions'
import { restoreAll, stub } from '../../../tests/helpers/stubUtils'

describe(checkPermissions.name, function () {
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
  it('throws if method/pub is not invoked by user', () => {
    stub(Meteor, 'user', () => {})
    const wrapped = checkPermissions({})
    const thrown = expect(() => wrapped.run()).to.throw('errors.permissionDenied')
    thrown.with.property('reason', 'errors.userNotExists')
    thrown.with.deep.property('details', { userId: undefined })
  })
  it('throws if method/pub is backend-only but not invoked by backend user', () => {
    const userId = Random.id()

    stub(Meteor, 'user', () => ({ _id: userId }))
    const wrapped = checkPermissions({ backend: true })
    const thrown = expect(() => wrapped.run()).to.throw('errors.permissionDenied')
    thrown.with.property('reason', 'errors.backendOnly')
    thrown.with.deep.property('details', { userId })
  })
  it('runs the method if invoked by a user', () => {
    const userId = Random.id()
    stub(Meteor, 'user', () => ({ _id: userId }))

    const wrapped = checkPermissions({ run: (name) => `${name} foo` })
    expect(wrapped.run('hello,')).to.equal('hello, foo')
  })
  it('runs the backend method if invoked by a backend user', () => {
    const userId = Random.id()
    const user = ({ _id: userId, services: { lea: {} } })
    stub(Meteor, 'user', () => user)
    stub(Meteor.users, 'findOne', () => user)

    const wrapped = checkPermissions({ backend: true, run: (name) => `${name} foo` })
    expect(wrapped.run('hello,')).to.equal('hello, foo')
  })
})
