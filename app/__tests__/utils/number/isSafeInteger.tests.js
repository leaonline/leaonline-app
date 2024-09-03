import { isSafeInteger } from '../../../lib/utils/number/isSafeInteger'
import { getInvalidIntegers } from '../../../__testHelpers__/getInvalidIntegers'

describe(isSafeInteger.name, function () {
  it('returns false for invalid integers', () => {
    const invalid = getInvalidIntegers()
    invalid.forEach(value => {
      expect(isSafeInteger(value)).toBe(false)
    })
  })
  it('returns true on valid integers', () => {
    const valid = [1, 2, 3, 0, -1, -2, 1.0, -3.0]
    valid.forEach(value => {
      expect(isSafeInteger(value)).toBe(true)
    })
  })
})
