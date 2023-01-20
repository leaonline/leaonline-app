import { getScoring } from '../../scoring/getScoring'

export const checkResponse = async ({ currentResponse }) => {
  if (!currentResponse || !currentResponse.data || !currentResponse.responses) {
    throw new Error('Response always needs to exist')
  }

  const { responses, data } = currentResponse
  const { type, subtype, value } = data
  const itemDoc = { type, subtype, ...value }
  const scoreResult = await getScoring(itemDoc, { responses })
  const allTrue = scoreResult.every(entry => entry.score)

  return { scoreResult, allTrue }
}
