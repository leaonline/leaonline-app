import { computeProgress } from '../../../components/progress/computeProgress'

describe(computeProgress.name, () => {
  it('always returns a valid progress', () => {
     [
       { current: undefined, max: 9, expected: 0.1 },
       { current: undefined, max: undefined, expected: 0.5 },
       { current: 5, max: undefined, expected: 1 },
       { current: -4, max: 9, expected: 0 },
       { current: -1, max: 9, expected: 0 },
       { current: 0, max: 9, expected: 0.1 },
       { current: 1, max: 9, expected: 0.2 },
       { current: 2, max: 9, expected: 0.3 },
       { current: 5, max: 9, expected: 0.6 },
       { current: 8, max: 9, expected: 0.9 },
       { current: 9, max: 9, expected: 1 },
       { current: 10, max: 9, expected: 1 },
       { current: 1, max: -1, expected: 1 },
       { current: 1, max: -2, expected: 0 },
       { current: 1, max: Infinity, expected: 0 },
       { current: Infinity, max: Infinity, expected: 0 },
       { current: {}, max: {}, expected: 0 },
       { current: 1, max: null, expected: 1 },
     ].forEach(({ current, max, expected }) => {
       expect(computeProgress({ current, max })).toEqual(expected)
     })
  })
})
