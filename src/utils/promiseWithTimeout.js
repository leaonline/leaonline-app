export const promiseWithTimeout = (promise, timeout) => {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(), timeout)
    })
  ])
}
