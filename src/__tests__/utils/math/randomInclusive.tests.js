import { randomIntInclusive } from '../../../lib/utils/math/randomIntInclusive'
import { getInvalidIntegers } from '../../../__testHelpers__/getInvalidIntegers'

describe(randomIntInclusive.name, function () {
  it('throws if one or both numbers are not valid ints', () => {
    const invalid = getInvalidIntegers()
    invalid.forEach(value => {
      expect(() => randomIntInclusive(value, 1))
        .toThrow(`Expected safe integers, got ${value} and 1`)
      expect(() => randomIntInclusive(1, value))
        .toThrow(`Expected safe integers, got 1 and ${value}`)
    })
  })
})

