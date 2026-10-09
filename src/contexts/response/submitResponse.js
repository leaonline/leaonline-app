import { getCollection } from '../../api/utils/getCollection'
import { Response } from './Response'

/**
 * @async
 * @param param0
 * @param param0.userId
 * @param param0.responseDoc
 * @return {Promise<void>|*}
 */
export const submitResponse = ({ userId, responseDoc }) => {
  responseDoc.timeStamp = new Date()
  responseDoc.userId = userId

  const modifier = { $set: responseDoc }
  const selector = {
    sessionId: responseDoc.sessionId,
    unitId: responseDoc.unit,
    page: responseDoc.page,
    userId
  }

  return getCollection(Response.name).upsertAsync(selector, modifier)
}
