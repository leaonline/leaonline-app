import { toInteger } from '../../../lib/utils/number/toInteger'

describe(toInteger.name, function () {
  it('parses string to an integer', () => {
    [
      ['1', 1],
      ['1.0', 1],
      ['1.1', 1],
      ['-1', -1],
      ['-1.0', -1],
      ['-1.1', -1]
    ].forEach(([n, expected]) => {
      expect(toInteger(n)).toBe(expected)
    })
  })
})
