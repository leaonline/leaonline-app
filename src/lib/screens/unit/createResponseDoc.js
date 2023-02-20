import { getScoring } from '../../scoring/getScoring'

/**
 * Evaluates responses
 * @param currentResponse {object} the current page's response context
 * @param currentResponse.data {object} related element data
 * @param currentResponse.data.type {object} should be 'item'
 * @param currentResponse.data.subtype {object} defines the item type like Cloze, Choice etc.
 * @param currentResponse.data.value {object} item value definitions like scoring, text, etc.
 * @param currentResponse.responses {Array<string|number>} array of strings or numbers, the index of the response represents
 *  the item-index
 * @return {Promise<{scoreResult: object, allTrue: boolean }>}
 */
export const checkResponse = async ({ currentResponse }) => {
  if (!currentResponse || !currentResponse.data || !currentResponse.responses) {
    throw new Error('Response always needs to exist')
  }

  const { responses, data } = currentResponse
  const { type, subtype, value } = data

  // we construct an item-doc that holds all item-defnitions
  // independent from the current response, it guides the scoring
  // on which score-function to pick, how to evaluate etc.
  const itemDoc = { type, subtype, ...value }
  const scoreResult = await getScoring(itemDoc, { responses })
  const allTrue = scoreResult.every(entry => entry.score)

  return { scoreResult, allTrue }
}
