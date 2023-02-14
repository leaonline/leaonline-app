/**
 * Runs a race of a given promise against a given timeout.
 *
 * @param promise {Promise<*>}
 * @param timeout {number}
 * @return {Promise<Awaited<unknown>>}
 */
export const promiseWithTimeout = (promise, timeout) => {
  let time

  const other = new Promise((resolve) => {
    time = setTimeout(() => resolve(), timeout)
  })

  const race = Promise.race([promise, other])
  race.finally(() => clearTimeout(time))

  return race
}
