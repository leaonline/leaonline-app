/* eslint-env mocha */
import { hasProp } from '../hasProp'
import { expect } from 'chai'

describe(hasProp.name, () => {
  it('checks if an object has an own property', () => {
    const obj = {
      foo: 'bar',
    }
    expect(hasProp(obj, 'foo')).to.equal(true)
    expect(hasProp(obj, 'prototype')).to.equal(false)
    expect(hasProp(obj, '__proto__')).to.equal(false)
  })
})
