/* eslint-env mocha */
import { expect } from 'chai'
import { publishDefaultAccountFields } from '../publishDefaultAccountFields'
import { restoreCollections, stubCollection } from '../../../tests/helpers/stubCollection'
import { getUsersCollection } from '../../collections/getUsersCollection'

describe(publishDefaultAccountFields.name, function () {
  before(() => {
    stubCollection([getUsersCollection()])
  })
  after(() => {
    restoreCollections()
  })
  it('skips if no user is authenticated', done => {
    publishDefaultAccountFields.call({ ready: done })
  })
  it('filters sensitive fields', () => {
    const userId = getUsersCollection().insert({
      username: 'moo',
      emails: [{ address: 'foo@bar.com' }],
      services: { foo: 'bar' },
      device: { platform: 'superOS' }
    })
    const [userDoc] = publishDefaultAccountFields.call({ userId }).fetch()
    expect(userDoc).to.deep.equal({
      _id: userId,
      username: 'moo'
    })
  })
})
