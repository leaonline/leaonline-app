/* eslint-env mocha */
import { expect } from 'chai'
import { createIdSet } from '../createIdSet'

describe(createIdSet.name, () => {
  it('creates a new set of values', () => {
    const docs = [
      { id: '1', foo: 'bar', bar: 'baz', baz: 'moo' },
      { id: '2', foo: 'moo', bar: undefined, baz: 'moo' },
      { id: '3', foo: 'moo', bar: 'foo', baz: 'moo' }
    ]
    const set = [...createIdSet(docs, ['foo', 'bar'])]
    expect(set).to.deep.equal(['bar', 'baz', 'moo', 'foo'])
  })
})
