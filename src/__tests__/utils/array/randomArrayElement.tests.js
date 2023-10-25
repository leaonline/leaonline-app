import { randomArrayElement } from '../../../lib/utils/array/randomArrayElement'

jest.retryTimes(1)

describe(randomArrayElement.name, function () {
  it('returns the first element in 0 or 1 length arrays', () => {
    expect(randomArrayElement([])).toBe(undefined)
    expect(randomArrayElement([0])).toBe(0)
  })
  it('throws if given value is no arary', () => {
    [{}, () => {}, new Date(), 1, "1", false, undefined, null]
      .forEach(value => {
        expect(() => randomArrayElement(value))
          .toThrow(`Expected array, got ${value}`)
      })
  })
  it('returns a random element from an array', () => {
    const input = [0,1,2,3,4,5,6,7,8,9,10]
    const covered = new Set()
    for (let i = 0; i < 1000; i++) {
      const element = randomArrayElement(input)
      covered.add(element)
      const index = input.indexOf(element)
      expect(index).toBeGreaterThan(-1)
    }

    // there might be the chance of failing,
    // but it's super low!
    // still we use retryTimes to cover this
    expect(covered.size).toBe(input.length)
  })
})
