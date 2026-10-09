/* eslint-env mocha */
import { Meteor } from 'meteor/meteor'
import { expect } from 'chai'
import { normalizeError } from '../normalizeError'
import { DocNotFoundError } from '../DocNotFoundError'

describe(normalizeError.name, function () {
  it('normalizes a native error', () => {
    const e = normalizeError({ error: new Error('foo') })
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
    const e = normalizeError({ error: new FooError('bar') })
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
    const name = 'foo'
    const reason = 'bar'
    const details = { baz: 'moo' }
    const err = new Meteor.Error(name, reason, details)
    const e = normalizeError({ error: err })
    const { createdAt, stack, ...rest } = e

    expect(createdAt).to.be.an.instanceOf(Date)
    expect(stack).to.include('Error: bar [foo]')
    expect(rest).to.deep.equal({
      details: details,
      message: 'bar [foo]',
      name: 'Error',
      reason: reason,
      title: name,
      type: 'Meteor.Error',
      userId: undefined
    })
  })
  it('normalizes a custom Meteor error', () => {
    const reason = 'bar'
    const details = { baz: 'moo' }
    const err = new DocNotFoundError(reason, details)
    const e = normalizeError({ error: err })
    const { createdAt, stack, ...rest } = e

    expect(createdAt).to.be.an.instanceOf(Date)
    expect(stack).to.include('Error: bar [errors.docNotFound]')
    expect(rest).to.deep.equal({
      details: details,
      message: 'bar [errors.docNotFound]',
      name: 'DocNotFoundError',
      reason: reason,
      title: 'errors.docNotFound',
      type: 'Meteor.Error',
      userId: undefined
    })
  })
})
