/**
 * Asynchronous timeout using Promises
 * @category Utils
 * @param ms {Number} and integer to define milliseconds of timeout
 * @return {Promise}
 */
export const asyncTimeout = ms => new Promise(resolve => {
  const timer = setTimeout(() => {
    clearTimeout(timer)
    resolve()
  }, ms)
})
