import { toInteger } from '../../utils/number/toInteger'
import { isUndefinedResponse } from '../../scoring/isUndefinedResponse'
import { Scoring } from '../../scoring/Scoring'

export const scoreHighlight = function (itemDoc = {}, responseDoc = {}) {
  // check(itemDoc.scoring, [{
  //   competency: String,
  //   correctResponse: [Number],
  //   requires: Number
  // }])

  const { scoring } = itemDoc
  const isUndefined = isUndefinedResponse(responseDoc.responses)

  // of not undefined we check and map all responses to valid integers
  const mappedResponses = !isUndefined && {
    responses: responseDoc.responses.map(value => {
      // we need to check for value integrity, allowed are strings of integers
      // or integers (which could also .0 floats, they are basically ints in JS)
      // check(value, Match.Where(isSafeInteger))
      return toInteger(value)
    })
  }

  return scoring.map(entry => {
    if (isUndefined) {
      return fail(entry, responseDoc, isUndefined)
    }

    switch (entry.requires) {
      case Scoring.types.all.value:
        return scoreAll(entry, mappedResponses)
      case Scoring.types.allInclusive.value:
        return scoreAllInclusive(entry, mappedResponses)
      case Scoring.types.any.value:
        return scoreAny(entry, mappedResponses)
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

function scoreAll ({ competency, correctResponse }, { responses }) {
  if (correctResponse.length !== responses.length) {
    return fail({ competency, correctResponse }, { responses }, false)
  }

  correctResponse.sort()
  responses.sort()

  const score = correctResponse.every((value, index) => responses[index] === value)
  return { competency, correctResponse, value: responses, score, isUndefined: false }
}

function scoreAllInclusive ({ competency, correctResponse }, { responses }) {
  return correctResponse.every((value) => responses.includes(value))
    ? { competency, correctResponse, value: responses, score: true, isUndefined: false }
    : { competency, correctResponse, value: responses, score: false, isUndefined: false }
}

function scoreAny ({ competency, correctResponse }, { responses }) {
  return correctResponse.some(value => responses.includes(value))
    ? { competency, correctResponse, value: responses, score: true, isUndefined: false }
    : { competency, correctResponse, value: responses, score: false, isUndefined: false }
}
