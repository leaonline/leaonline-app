import { CompareState } from '../../../lib/items/utils/CompareState'
import Colors from '../../../lib/constants/Colors'
import { simpleRandom } from '../../../__testHelpers__/simpleRandom'
import { Scoring } from '../../../lib/scoring/Scoring'

describe('CompareState', () => {
  describe(CompareState.getColor.name, () => {
    it('returns the correct color for given values', () => {
      [
        { value: -1, color: Colors.missing },
        { value: 1, color: Colors.right },
        { value: 0, color: Colors.wrong },
        { value: simpleRandom(), color: undefined }
      ].forEach(({ value, color }) => {
        expect(CompareState.getColor(value)).toEqual(color)
      })
    })
  })
  describe(CompareState.getValue.name, function () {
    it('returns the correspondig value by given score and response value', () => {
      [
        { score: false, value: 'a', expected: 0 },
        { score: false, value: {}, expected: 0 },
        { score: false, value: [], expected: -1 },
        { score: false, value: '', expected: -1 },
        { score: false, value: undefined, expected: -1 },
        { score: false, value: null, expected: -1 },
        { score: false, value: Scoring.UNDEFINED, expected: -1 },
        { score: true, value: '', expected: 1 },
        { score: true, value: 'a', expected: 1 },
        { score: true, value: [], expected: 1 },
        { score: true, value: {}, expected: 1 },
        { score: true, value: undefined, expected: 1 },
        { score: true, value: null, expected: 1 },
        { score: true, value: Scoring.UNDEFINED, expected: 1 }
      ].forEach(({ score, value, expected }) => {
        expect(CompareState.getValue(score, value)).toEqual(expected)
      })
    })
  })
})
