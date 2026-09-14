/* eslint-env mocha */
import { expect } from 'chai'
import { encodeQueryParams } from '../encodeQueryParams'

// !'()*

describe(encodeQueryParams.name, function () {
  it('returns a valid encoded query string for params', function () {
    // no special chars
    const simple1 = encodeQueryParams({ foo: 'bar' })
    expect(simple1).to.equal('foo=bar')
    expect(decodeURIComponent(simple1)).to.equal('foo=bar')

    const simple2 = encodeQueryParams({ foo: 'bar', bar: 'baz' })
    expect(simple2).to.equal('foo=bar&bar=baz')
    expect(decodeURIComponent(simple2)).to.equal('foo=bar&bar=baz')

    // with special chars
    const special1 = encodeQueryParams({ bar: 'let\'s rock (*wow)' })
    expect(special1).to.equal('bar=let%27s%20rock%20%28%2Awow%29')
    expect(decodeURIComponent(special1)).to.equal('bar=let\'s rock (*wow)')

    const special2 = encodeQueryParams({ baz: 'hello+world!=cool' })
    expect(special2).to.equal('baz=hello%2Bworld%21%3Dcool')
    expect(decodeURIComponent(special2)).to.equal('baz=hello+world!=cool')
  })

  it('returns a valid encoded query string for params with arrays', function () {
    // no special chars
    const simple1 = encodeQueryParams({ foo: ['bar', 'baz'] })
    expect(simple1).to.equal('foo=bar&foo=baz')
    expect(decodeURIComponent(simple1)).to.equal('foo=bar&foo=baz')

    const simple2 = encodeQueryParams({ foo: ['bar', 'baz'], bar: 'baz' })
    expect(simple2).to.equal('foo=bar&foo=baz&bar=baz')
    expect(decodeURIComponent(simple2)).to.equal('foo=bar&foo=baz&bar=baz')

    // with special chars
    const special1 = encodeQueryParams({ bar: ['hello+world!=cool', 'let\'s rock (*wow)'] })
    expect(special1).to.equal('bar=hello%2Bworld%21%3Dcool&bar=let%27s%20rock%20%28%2Awow%29')
    expect(decodeURIComponent(special1)).to.equal('bar=hello+world!=cool&bar=let\'s rock (*wow)')
  })
})
