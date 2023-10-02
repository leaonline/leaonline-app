import { toArrayIfNot } from '../../../lib/utils/array/toArrayIfNot'

describe(toArrayIfNot.name, function () {
  it('returns an empty array if undefined is passed', () => {
    expect(toArrayIfNot()).toStrictEqual([])
  })
  it('returns an array of a single non-array value/object', () => {
    [() => {}, {}, 1, '1', false, true, 0.1 + 0.2, null]
      .forEach(value => {
        expect(toArrayIfNot(value))
          .toStrictEqual([value])
      })
  })
  it('returns the array if it is an array', () => {
    [[() => {}], [{}], [1], ['1'], [false], [true], [0.1 + 0.2], [null]]
      .forEach(array => {
        expect(toArrayIfNot(array) === array).toBe(true)
      })
  })
})

