/**
 * setTimeout in async mode
 * @async
 * @module
 * @param ms {Number}
 * @return {Promise<void>}
 */
export const asyncTimeout = ms => new Promise(resolve => {
  setTimeout(() => resolve(), ms)
})
