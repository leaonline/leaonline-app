
/**
 * Awaits a given promise and catches the error, if any.
 * The error is passed into the onError callback.
 * If no error got catched, it will run the fail-function.
 * @param promise {Promise.<*>}
 * @returns {Promise<error>}
 */
export const expectAsyncError = async (promise) => {
  try {
    await promise
  } catch (e) {
    return e
  }
}
