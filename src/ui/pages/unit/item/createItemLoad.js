import { noop } from '../../../../utils/noop'

/**
 * Revives an item state from response cache. The returned function is to be
 * passed to the renderer / rendererfactory.
 *
 * @param {ResponseCache} cache The cache used to load the item from
 * @param {boolean} createIfMissing Whether to create a new entry if the item is not found in the cache
 * @param {function} debug A debug function to log the loading process
 * @return {function({ userId:string, sessionId:string, unitId:string, page:string, type:string, contentId:string }): object|undefined}
 */
export const createItemLoad = ({ cache, createIfMissing = false, debug = noop }) => {
  return function onItemLoad ({ userId, sessionId, unitId, page, type, contentId }) {
    debug('load item data', { sessionId, unitId, page, contentId })
    const entry = cache.load({ sessionId, unitId, page, contentId })
    debug('entry found?', entry)
    if (!entry && createIfMissing) {
      return cache.save({
        userId,
        sessionId,
        unitId,
        page,
        type,
        contentId,
        responses: []
      })
    }
    return entry
  }
}
