import { isValidNumber } from '../../../lib/utils/number/isValidNumber'
import { getInvalidNumbers } from '../../../__testHelpers__/getInvalidNumbers'

describe(isValidNumber.name, function () {
  it('returns false on invalid integers', () => {
    const invalid = getInvalidNumbers()
    invalid.forEach(value => {
      expect(isValidNumber(value)).toBe(false)
    })
  })
})
