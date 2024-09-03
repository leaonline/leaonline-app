import { createScoringSummaryForInput } from '../../../lib/items/cloze/createScoringSummaryForInput'
import { CompareState } from '../../../lib/items/utils/CompareState'
import { UndefinedScore } from '../../../lib/scoring/UndefinedScore'

describe(createScoringSummaryForInput.name, function () {
  it('creates a summary for a single-score response for an input', function () {
    ['moo', ['moo'], undefined, [undefined], UndefinedScore, [UndefinedScore]].forEach(value => {
      [true, false].forEach(score => {
        const expectedColor = CompareState.getColor(score ? 1 : 0)
        const entries = [{ value, score: score ? 1 : 0 }]
        const summary = createScoringSummaryForInput({
          itemIndex: 5,
          actual: value,
          entries
        })
        expect(summary).toEqual({
          index: 5,
          score: score ? 1 : 0,
          actual: value,
          color: expectedColor,
          entries
        })
      })
    })
  })

  it('creates a summary for a multiple-score response for an input', function () {
    ['moo', ['moo'], undefined, [undefined], UndefinedScore, [UndefinedScore]].forEach(value => {
      [0, 1, 2, 3].forEach(trueScores => {
        const avg = trueScores / 3
        const expectedColor = CompareState.getColor(Math.floor(avg))
        const entries = [
          { value, score: trueScores > 0 ? 1 : 0 },
          { value, score: trueScores > 1 ? 1 : 0 },
          { value, score: trueScores > 2 ? 1 : 0 }
        ]
        const summary = createScoringSummaryForInput({
          itemIndex: 5,
          actual: value,
          entries
        })
        expect(summary).toEqual({
          index: 5,
          score: avg,
          actual: value,
          color: expectedColor,
          entries
        })
      })
    })
  })
})
