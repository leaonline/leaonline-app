import { Choice } from './Choice'
import { Scoring } from '../../scoring/Scoring'
import { isUndefinedResponse } from '../../scoring/isUndefinedResponse'
import { toInteger } from '../../utils/toInteger'

export const scoreChoice = function (itemDoc, responseDoc = {}) {
  Scoring.validateItemDoc(itemDoc)

  const { scoring, flavor } = itemDoc

  return scoring.map(entry => {
    switch (flavor) {
      case Choice.flavors.single.value:
        return scoreSingle(entry, responseDoc)
      case Choice.flavors.multiple.value:
        return scoreMultiple(entry, responseDoc)
      default:
        throw new Error(`Unexpected choice flavor: ${flavor}`)
    }
  })
}

function scoreSingle ({ competency, correctResponse, requires }, { responses = [] }) {
  // single choice have only one selected value
  let value = responses[0]
  let score = false
  const isUndefined = isUndefinedResponse(value)

  if (isUndefined) {
    return { competency, correctResponse, value, score, isUndefined }
  }

  // we need to check for value integrity, allowed are strings of integers
  // or integers (which could also .0 floats, they are basically ints in JS)
  // check(value, Match.Where(isSafeInteger))

  // values are always sent as string
  // se we need to parse them first
  value = toInteger(value)

  // if all values are required, we only
  // use the first defined expected value
  score = correctResponse.includes(value)

  return { competency, correctResponse, value, score, isUndefined }
}

function scoreMultiple ({ competency, correctResponse, requires }, { responses = [] }) {
  if (isUndefinedResponse(responses)) {
    return {
      competency,
      correctResponse,
      value: responses,
      score: false,
      isUndefined: true
    }
  }

  switch (requires) {
    case Scoring.types.all.value:
      return scoreMultipleAll({
        competency,
        correctResponse,
        requires
      }, { responses })
    case Scoring.types.any.value:
      return scoreMultipleAny({
        competency,
        correctResponse,
        requires
      }, { responses })
    default:
      throw new Error(`Unexpected scoring type: ${requires}`)
  }
}

function scoreMultipleAll ({ competency, correctResponse, requires }, { responses }) {
  const mappedResponses = responses.map(value => {
    // we need to check for value integrity, allowed are strings of integers
    // or integers (which could also .0 floats, they are basically ints in JS)
    // check(value, Match.Where(isSafeInteger))
    return toInteger(value)
  }).sort()
  let score = false

  // if length does not match we can already return false
  // but use the mapped responses in order to not give the impression
  // that there is a false-negative due to missing value parsing
  if (responses.length !== correctResponse.length) {
    return {
      competency,
      correctResponse,
      value: mappedResponses,
      score,
      isUndefined: false
    }
  }

  // otherwise we assume, that multiple-all is true if the indices exactly match
  score = correctResponse.sort().every((responseValue, positionIndex) => {
    return mappedResponses[positionIndex] == responseValue
  })
  return {
    competency,
    correctResponse,
    value: mappedResponses,
    score,
    isUndefined: false
  }
}

function scoreMultipleAny ({ competency, correctResponse, requires }, { responses }) {
  const mappedResponses = responses
    .map(value => {
      if (isUndefinedResponse(value)) return undefined
      // we need to check for value integrity, allowed are strings of integers
      // or integers (which could also .0 floats, they are basically ints in JS)
      // check(value, Match.Where(isSafeInteger))
      return toInteger(value)
    })
  const score = mappedResponses.some(value => correctResponse.includes(value))

  return {
    competency,
    correctResponse,
    value: mappedResponses,
    score,
    isUndefined: false
  }
}
