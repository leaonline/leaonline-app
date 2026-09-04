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
  it('adds the timestamp to the current user', async () => {
    const userId = await getUsersCollection().insertAsync({})
    const user = { _id: userId }
    await onAccountLoginHandler({ user })
    const userDoc = await getUsersCollection().findOneAsync(userId)
    expect(userDoc.lastLogin).to.be.instanceOf(Date)
  })
})
