/* eslint-env mocha */
import { expect } from 'chai'
import { createMethod } from '../createMethod'

describe(createMethod.name, function () {
  it('creates a new Meteor method', function () {
    const method = createMethod({
      name: 'tests.method.exec',
      schema: { foo: String },
      run: function ({ foo }) {
        return `${foo}-bar`
      }
    })
    expect(method._execute({}, {foo: 'foo'})).to.equal('foo-bar')
  })
})
