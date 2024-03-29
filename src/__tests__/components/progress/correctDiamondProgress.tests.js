import { correctDiamondProgress } from '../../../lib/components/progress/correctDiamondProgress'

describe(correctDiamondProgress.name, () => {
  it('falls back to 0 if no valid number is given', () => {
    ['', '1', null, undefined, NaN, Infinity, {}, [], true, false, () => {}]
      .forEach(value => {
        expect(correctDiamondProgress(value)).toEqual(0)
      })
  })
  it('returns the appropriate value for a given number', () => {
    [
      { value: -2, expected: 0 },
      { value: -1, expected: 0 },
      { value: -0.1, expected: 0 },
      { value: 0, expected: 0 },
      { value: 0.01, expected: 0.3 },
      { value: 0.1, expected: 0.3 },
      { value: 0.24, expected: 0.3 },
      { value: 0.25, expected: 0.3 },
      { value: 0.31, expected: 0.31 },
      { value: 0.5, expected: 0.5 },
      { value: 0.74, expected: 0.74 },
      { value: 0.75, expected: 0.75 },
      { value: 0.76, expected: 0.75 },
      { value: 0.89, expected: 0.75 },
      { value: 0.9, expected: 1 },
      { value: 0.99, expected: 1 },
      { value: 1, expected: 1 },
      { value: 1.01, expected: 1 }
    ].forEach(({ value, expected }) => {
      expect(correctDiamondProgress(value)).toEqual(expected)
    })
  })
})
