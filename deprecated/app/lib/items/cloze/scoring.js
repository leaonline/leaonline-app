import { isUndefinedResponse } from '../../scoring/isUndefinedResponse'

// TODO rename file to scoreCloze
export const scoreCloze = function scoreCloze (itemDoc, responseDoc) {
  const { scoring } = itemDoc

  // checks all entries for undefined so we skip further
  // expensive computations and set all to false + undefined flag
  const allUndefined = isUndefinedResponse(responseDoc.responses)

  return scoring.map(entry => {
    if (allUndefined) {
      return {
        competency: entry.competency,
        correctResponse: entry.correctResponse,
        value: responseDoc.responses[entry.target],
        score: false,
        target: entry.target,
        isUndefined: true
      }
    }

    return scoreBlanks(entry, responseDoc)
  })
}

function scoreBlanks (entry, { responses }) {
  let score = false
  const { correctResponse, competency, target } = entry
  const value = responses[target]

  // we still may have individual undefined cases and we need to cover, that
  // there may be text inputs, that explictly ask for an undefined response
  const isUndefined = !correctResponse.source.includes('__undefined__') && isUndefinedResponse(value)

  if (isUndefined) {
    return { competency, correctResponse, value, target, score, isUndefined }
  }

  // check(value, Match.Where(isSafeTextString))

  // texts are scored against a RegExp pattern
  score = correctResponse.test(value)

  return { competency, correctResponse, value, target, score, isUndefined: false }
}
