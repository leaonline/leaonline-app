/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { createMethod } from '../createMethod'
import { stub, restoreAll } from '../../../tests/helpers/stubUtils'

describe(createMethod.name, function () {
  afterEach(function () {
    restoreAll()
  })

  it('creates a new Meteor method', function () {
    createMethod({
      name: 'tests.method.exec',
      schema: { foo: String },
      run: function ({ foo }) {
        return `${foo}-bar`
      }
    })
    stub(Meteor, 'user', () => ({ _id: 'some-user-id' }))
    const result = Meteor.call('tests.method.exec', { foo: 'foo' })
    expect(result).to.equal('foo-bar')
  })
})
