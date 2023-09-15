/* eslint-env mocha */
import { expect } from 'chai'
import { restoreCollections, stubCollection } from '../../../tests/helpers/stubCollection'
import { onAccountLoginHandler } from '../onAccountLoginHandler'
import { getUsersCollection } from '../../collections/getUsersCollection'

describe(onAccountLoginHandler.name, function () {
  before(() => {
    stubCollection([getUsersCollection()])
  })
  after(() => {
    restoreCollections()
  })
  it('adds the timestamp to the current user', () => {
    const userId = getUsersCollection().insert({})
    const user = { _id: userId }
    onAccountLoginHandler({ user })
    const userDoc = getUsersCollection().findOne(userId)
    expect(userDoc.lastLogin).to.be.instanceOf(Date)
  })
})
