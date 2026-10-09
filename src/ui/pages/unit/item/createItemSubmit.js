import { callMethod } from '../../../../infrastructure/methods/callMethod'
import { Response } from '../../../../contexts/response/Response'
import { getProperty } from '../../../../utils/object/getProperty'

/**
 * Returns a submit function that restores values from cache and sends them
 * to the server.
 * @param loadValue {Function}
 * @param prepare {Function}
 * @param receive {Function}
 * @param onSuccess {Function}
 * @param onError {Function}
 * @return {function({sessionId?: *, unitDoc: *, page?: *}): *}
 */
export const createItemSubmit = ({ loadValue, prepare, receive, onError, onSuccess }) => {
  /**
   *
   * @param sessionId {String} The current {Session} id
   * @param unitDoc {Unit} The current {Unit} document
   * @param page {Number} the current page of this unit
   * @return {Promise} A promise that resolves, once all items been submitted
   */
  return ({ sessionId, unitDoc, dimensionId, page, scores }) => {
    const unitId = unitDoc._id
    const unitSetId = unitDoc.unitSet
    const allResponseDocs = []

    const contentPage = getProperty(unitDoc.pages || [], page)

    // xxx: circumvent special case, where there is no pages or no content
    if (Array.isArray(contentPage?.content)) {
      contentPage.content.forEach(entry => {
        // we iterate the full page structure
        // so we skip on any content
        // that is not flagged as item type
        if (entry.type !== 'item') return
        const { contentId } = entry
        const itemType = entry.subType || entry.subtype
        const responseValue = loadValue({ sessionId, unitId, page, contentId })
        allResponseDocs.push({
          sessionId,
          unitId,
          unitSetId,
          dimensionId,
          page,
          itemId: contentId,
          itemType,
          responses: (responseValue?.responses) || [],
          scores
        })
      })
    }
    debugger
    return Promise.all(allResponseDocs.map(responseDoc =>
      callMethod({
        name: Response.methods.submit.name,
        args: responseDoc,
        prepare: () => {
          console.debug('[submit item]:', responseDoc)
          if (prepare) prepare(responseDoc)
        },
        receive: () => {
          if (receive) prepare(receive)
        },
        failure: error => {
          if (onError) onError(error, responseDoc)
        },
        success: result => {
          if (onSuccess) onSuccess(result, responseDoc)
        }
      })
    ))
  }
}
