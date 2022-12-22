const defaultMessage = 'promise.timedOut'

/**
 * Lets a promise race against a timeout. If the promise settles before the timeout then it will
 * be the one to use (no matter, whether it has been resolved or rejected).
 *
 * Otherwise the internally created timeout promise will be used to resolve to a message
 * or reject an error, depending on the used options.
 *
 * @example
 * createTimedPromise(new Promise((resolve, reject) => { ... }))
 *   .then(result => console.log(result))
 *   .catch(error => console.error(error))
 *
 * @param promise {Promise} the promise to race against the timeout
 * @param timeout {number=}  optional number of milliseconds until timeout, defaults to 1000ms / 1 sec
 * @param throwIfTimedOut {boolean=} optional flag to either reject (of true) or resolve (if false)
 * @param message {string=} optional message to be resolved/rejected on timeour
 * @return {Promise<Awaited<unknown>>}
 */
export const createTimedPromise = (promise, { timeout = 1000, throwIfTimedOut = false, message, details } = {}) => {
  let timeOut

  const race = Promise.race([
    promise,
    new Promise((resolve, reject) => {
      timeOut = setTimeout(() => {
        if (throwIfTimedOut) {
          const error = new Error(message || defaultMessage)
          error.details = details
          return reject(error)
        }
        else {
          return resolve(message || defaultMessage)
        }
      }, timeout)
    })
  ])

  // always clear timeout to prevent weird bullshit
  race.finally(() => clearTimeout(timeOut))

  return race
}
