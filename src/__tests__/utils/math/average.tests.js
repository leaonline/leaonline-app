import { average } from '../../../lib/utils/math/average'

describe(average.name, function () {
  it('computes the average between two values', () => {
    [
      [0, 0, 0],
      [0, 1, 0],
      [1, 2, 0.5],
      [1, 3, 1 / 3],
      [-1, 3, 0],
      [-1, -1, 0],
    ].forEach(([sum, max, expected]) => {
      expect(average(sum, max)).toBe(expected)
    })
  })
})
