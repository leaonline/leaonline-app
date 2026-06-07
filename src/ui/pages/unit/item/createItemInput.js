import { noop } from '../../../../utils/noop'

/**
 * Creates an item input that stores it into a given cache.
 * @param cache {ResponseCache}
 * @param debug {function}
 * @return {onItemInput}
 */
export const createItemInput = ({ cache, debug = noop }) => {
  return ({ userId, sessionId, unitId, page, type, contentId, responses }) => {
    debugger
    debug('cache item data', { userId, sessionId, unitId, page, type, contentId, responses })
    return cache.save({
      userId,
      sessionId,
      unitId,
      page,
      type,
      contentId,
      responses
    })
  }
}
