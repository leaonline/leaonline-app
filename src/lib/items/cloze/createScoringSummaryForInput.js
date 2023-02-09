import { CompareState } from '../utils/CompareState'
import { average } from '../../utils/math/average'

/**
 *
 * Why: There may be multiple competencies, pointing to a single input, that each have different
 * scoring rules. Therefor, we may end up with a structure where we can't map scoreResult <--> input on a 1:1 basis
 * and need to compute averages for these scores instead.
 *
 * This function makes it possible to create a summary of all scores for a given input, represented by an index.
 *
 * @param itemIndex
 * @param responses
 * @param entries
 * @return {{score: number, actual: string|number, entries: *[], color: string, index: number }}
 */
export const createScoringSummaryForInput = ({ itemIndex, actual, entries }) => {
  const summary = {
    index: itemIndex,
    score: 0, // computed average
    color: undefined,
    actual: actual,
    entries: []
  }

  // the maximum achievable score is
  // the number of score entries for this input
  const max = entries.length
  let sum = 0

  // converting true/false scores to integer values
  // and adding up the sum
  entries.forEach(entry => {
    const answerValue = Array.isArray(entry.value)
      ? entry.value[0]
      : entry.value
    sum += CompareState.getValue(entry.score, answerValue)
  })

  // finally, computing average of all scores
  // and decide, which color to assign
  summary.avg = average(sum, max)
  summary.color = CompareState.getColor(Math.floor(summary.avg))
  summary.entries = entries

  return summary
}
