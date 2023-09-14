/* eslint-env mocha */
import { expect } from 'chai'
import { Meteor } from 'meteor/meteor'
import { getUsersCollection } from '../getUsersCollection'

describe(getUsersCollection.name, function () {
  it('returns the Meteor users collection', () => {
    expect(getUsersCollection()).to.equal(Meteor.users)
  })
})