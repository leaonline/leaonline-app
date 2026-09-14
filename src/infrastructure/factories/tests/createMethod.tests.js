/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { createMethod } from '../createMethod'
import { stub, restoreAll } from '../../../tests/helpers/stubUtils'

describe(createMethod.name, function () {
  afterEach(function () {
    restoreAll()
  })

  it('creates a new Meteor method', async () => {
    createMethod({
      name: 'tests.method.exec',
      isPublic: true,
      schema: { foo: String },
      run: async function ({ foo }) {
        return `${foo}-bar`
      }
    })
    stub(Meteor, 'user', () => ({ _id: 'some-user-id' }))
    const result = await Meteor.call('tests.method.exec', { foo: 'foo' })
    expect(result).to.equal('foo-bar')
  })
})
