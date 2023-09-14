/* eslint-env mocha */
import { expect } from 'chai'
import { normalizeError } from '../normalizeError'

describe(normalizeError.name, function () {
  it('normalizes a native error', () => {
    const e = normalizeError({ error: new Error('foo')} )
    const { createdAt, stack, ...rest } = e
    expect(createdAt).to.be.an.instanceOf(Date)
    expect(stack).to.include('Error: foo')
    expect(rest).to.deep.equal({
      details: undefined,
      message: 'foo',
      name: 'Error',
      reason: undefined,
      title: undefined,
      type: 'native',
      userId: undefined
    })
  })
  it('normalizes a custom native error', () => {
    class FooError extends Error {
      constructor (message) {
        super(message)
        this.name = 'FooError'
      }
    }
    const e = normalizeError({ error: new FooError('bar')} )
    const { createdAt, stack, ...rest } = e
    expect(createdAt).to.be.an.instanceOf(Date)
    expect(stack).to.include('FooError: bar')
    expect(rest).to.deep.equal({
      details: undefined,
      message: 'bar',
      name: 'FooError',
      reason: undefined,
      title: undefined,
      type: 'native',
      userId: undefined
    })
  })
  it('normalizes a Meteor error', () => {
    expect.fail()
  })
  it('normalizes a custom Meteor error', () => {
    expect.fail()
  })
})
