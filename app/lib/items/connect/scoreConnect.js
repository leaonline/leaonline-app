import { isUndefinedResponse } from '../../scoring/isUndefinedResponse'
import { toInteger } from '../../utils/number/toInteger'

export const scoreConnect = function (itemDoc = {}, responseDoc = {}) {
  const { scoring } = itemDoc
  const isUndefined = isUndefinedResponse(responseDoc.responses)

  // of not undefined we check and map all responses to valid integers
  const mappedResponses = !isUndefined && responseDoc.responses.map(value => {
    const split = value.split(',')
    // we need to check for value integrity, allowed are strings of integers
    // or integers (which could also .0 floats, they are basically ints in JS)
    return split.map(toInteger)
  })

  return scoring.map(entry => {
    if (isUndefined) {
      return fail(entry, responseDoc, isUndefined)
    }
    /*
    TODO: implement
     switch (entry.requires) {
      case Scoring.types.all.value:
        return scoreAll(entry, mappedResponses, isUndefined)
      case Scoring.types.allInclusive.value:
        return scoreAllInclusive(entry, mappedResponses, isUndefined)
      case Scoring.types.any.value:
        return scoreAny(entry, mappedResponses, isUndefined)
      default:
        throw new Error(`Unexpected scoring type ${entry.requires}`)
     }
     */
    return scoreAllInclusive(entry, mappedResponses)
  })
}

function scoreAllInclusive (entry, mappedResponses) {
  const { competency, correctResponse } = entry
  const score = correctResponse.every(({ left, right }) => {
    return !!mappedResponses.find(([l, r]) => l === left && r === right)
  })

  return {
    competency,
    correctResponse,
    value: mappedResponses,
    score,
    isUndefined: false
  }
}

function fail ({ competency, correctResponse }, { responses }, isUndefined) {
  return {
    competency,
    correctResponse,
    value: responses,
    score: false,
    isUndefined
  }
}
