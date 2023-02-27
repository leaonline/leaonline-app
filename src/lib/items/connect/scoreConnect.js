import { Scoring } from '../../scoring/Scoring'
import { isUndefinedResponse } from '../../scoring/isUndefinedResponse'
import { toInteger } from '../../utils/toInteger'

export const scoreConnect = function (itemDoc = {}, responseDoc = {}) {
  const { scoring } = itemDoc
  const isUndefined = isUndefinedResponse(responseDoc.responses)

  // of not undefined we check and map all responses to valid integers
  const mappedResponses = !isUndefined && {
    responses: responseDoc.responses.map(value => {
      // we need to check for value integrity, allowed are strings of integers
      // or integers (which could also .0 floats, they are basically ints in JS)
      return toInteger(value)
    })
  }

  return scoring.map(entry => {
    if (isUndefined) {
      return fail(entry, responseDoc, isUndefined)
    }

    switch (entry.requires) {
      case Scoring.types.all.value:
        return fail(entry, mappedResponses, isUndefined)
      case Scoring.types.allInclusive.value:
        return fail(entry, mappedResponses, isUndefined)
      case Scoring.types.any.value:
        return fail(entry, mappedResponses, isUndefined)
      default:
        throw new Error(`Unexpected scoring type ${entry.requires}`)
    }
  })
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
