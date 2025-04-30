/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { updateUserProfile } from '../updateUserProfile'
import { stub, overrideStub, restoreAll } from '../../../tests/helpers/stubUtils'

describe(updateUserProfile.name, function () {
  afterEach(() => {
    restoreAll()
  })
  it('updates the args if given', () => {
    stub(Meteor.users, 'update', () => {})
    const userId = Random.id()
    ;[
      { voice: 'foo' },
      { speed: 0.1 },
      { device: {} }
    ].forEach(entry => {
      overrideStub(Meteor.users, 'update', (query, updateDoc) => {
        expect(query).to.deep.equal({ _id: userId })
        expect(updateDoc).to.deep.equal({ $set: entry })
      })
      updateUserProfile({ userId, ...entry })
    })
  })
  it('does not update the no args are given', () => {
    stub(Meteor.users, 'update', expect.fail)
    updateUserProfile({})
  })
})
