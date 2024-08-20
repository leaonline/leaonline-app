/* eslint-env mocha */
import { expect } from 'chai'
import { DocNotFoundError } from '../DocNotFoundError'

describe('DocNotFoundError', () => {
  it('should create default error prop', () => {
    const e = new DocNotFoundError('foo', { bar: 'baz'})
    expect(e.error).to.equal('errors.docNotFound')
    expect(e.name).to.equal('DocNotFoundError')
  })
})
