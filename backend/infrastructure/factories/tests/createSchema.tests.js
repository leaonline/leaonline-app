/* eslint-env mocha */
import { expect } from 'chai'
import { createSchema, Integer, oneOf, RegEx } from '../createSchema'

describe(createSchema.name, function () {
  it('creates a new schema instance', function () {
    const exampleSchema = createSchema({
      num: Integer,
      two: oneOf(String, Number),
      pattern: RegEx.EmailWithTLD
    })

    expect(() => exampleSchema.validate({})).to.throw('Num is required')

    ;[
      { num: 1, two: '1', pattern: 'me@example.com'},
      { num: 1, two: 1, pattern: 'me@example.com'},
    ].forEach(doc => exampleSchema.validate(doc))
  })
})
