/* eslint-env mocha */
import { expect } from 'chai'
import { truncatePercent } from './truncatePercent'
import { restoreAll, stub } from '../../../../../tests/helpers.tests'

describe(truncatePercent.name, () => {
  afterEach(() => {
    restoreAll()
  })
  it('throws if the input is not a number', () => {
    ;['1', '1.1232131', true, false, () => {}, {}, [], null, undefined].forEach(
      (input) => {
        expect(() => truncatePercent(input)).to.throw(
          `Expected a valid number, got ${input} (${typeof input}), in ${truncatePercent.name}.`,
        )
      },
    )
  })
  it('throws if the truncated input is not a safe integer', () => {
    stub(Math, 'trunc', () => NaN)
    expect(() => truncatePercent(1.111111)).to.throw(
      `Expected truncated safe integer, got ${NaN} (${typeof NaN}), in ${truncatePercent.name}.`,
    )
  })
  it('returns the integer base of the given input', () => {
    const toInt = (n) => Number(n.toString(10).split('.')[0])

    for (let i = 0; i < 100; i++) {
      const value = Math.random() * 100
      const expected = toInt(value)

      expect(truncatePercent(value)).to.equal(expected)
    }
  })
})
