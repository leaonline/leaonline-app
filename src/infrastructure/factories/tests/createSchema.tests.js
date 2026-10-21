/* eslint-env mocha */
import { expect } from 'chai'
import { createSchema, Integer, oneOf, RegEx } from '../createSchema'
import { expectThrown } from '../../../tests/helpers/expectThrown'

describe(createSchema.name, () => {
  it('creates a new schema instance', async () => {
    const exampleSchema = createSchema({
      num: Integer,
      two: oneOf(String, Number),
      pattern: RegEx.EmailWithTLD,
    })

    await expectThrown({
      fn: () => exampleSchema.validate({}),
      message: 'Num is required',
    })

    const valid = [
      { num: 1, two: '1', pattern: 'me@example.com' },
      { num: 1, two: 1, pattern: 'me@example.com' },
    ]

    for (const doc of valid) {
      exampleSchema.validate(doc)
    }
  })
})
