import { getCompareValuesForSelectableItems } from '../../../lib/items/shared/getCompareValuesForSelectableItems'

describe(getCompareValuesForSelectableItems.name, function () {
  it('scores correct selections as 1, wrong as 0 and missing as -1', () => {
    const inputs = [
      // single values
      [{ 0: true }, [0], { 0: 1 }], // correct
      [{ 1: true }, [0], { 0: -1, 1: 0 }], // wrong
      [{}, [3], { 3: -1 }], // no input
      // multiple values
      [{ 0: true, 3: true }, [0, 3], { 0: 1, 3: 1 }], // all correct
      [{ 1: true, 4: true }, [2, 3], { 1: 0, 2: -1, 3: -1, 4: 0 }], // all wrong
      [{ 1: true, 4: true }, [1, 3], { 1: 1, 3: -1, 4: 0 }], // right and wring
      [{}, [2, 3], { 2: -1, 3: -1 }] // no input
    ]

    inputs.forEach(([selected, correctResponses, expected]) => {
      const result = getCompareValuesForSelectableItems({ selected, correctResponses })
      expect(result).toEqual(expected)
    })
  })
})
