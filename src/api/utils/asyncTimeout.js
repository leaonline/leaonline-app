/**
 * setTimeout in async mode
 * @category api
 * @module asyncTimeout
 * @async
 * @param ms {Number}
 * @return {Promise<void>}
 */
export const asyncTimeout = ms => new Promise(resolve => {
  setTimeout(() => resolve(), ms)
})
