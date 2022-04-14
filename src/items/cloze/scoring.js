import { isUndefinedResponse } from '../../scoring/isUndefinedResponse'

export const scoreCloze = function scoreCloze (itemDoc = {}, responseDoc = {}) {
  // check(itemDoc.scoring, [{
  //   competency: [String],
  //   correctResponse: RegExp,
  //   target: Number
  // }])

  const { scoring } = itemDoc

  // checks all entries for undefined so we skip further
  // expensive computations and set all to false + undefined flag
  const allUndefined = isUndefinedResponse(responseDoc.responses)

  return scoring.map(entry => {
    if (allUndefined) {
      return {
        competency: entry.competency,
        correctResponse: entry.correctResponse,
        value: responseDoc.responses,
        score: false,
        isUndefined: true
      }
    }

    return scoreBlanks(entry, responseDoc)
  })
}

function scoreBlanks (entry, { responses = [] }) {
  if (!Array.isArray(responses)) {
    throw new Error('Match error: Failed Match.Where validation')
  }

  let score = false
  const { correctResponse, competency, target } = entry
  const value = responses[target]

  // we still may have individual undefined cases and we need to cover, that
  // there may be text inputs, that explictly ask for an undefined response
  const isUndefined = !correctResponse.source.includes('__undefined__') && isUndefinedResponse(value)

  if (isUndefined) {
    return { competency, correctResponse, value, score, isUndefined }
  }

  // check(value, Match.Where(isSafeTextString))

  // texts are scored against a RegExp pattern
  score = correctResponse.test(value)

  return { competency, correctResponse, value, score, isUndefined: false }
}
