/**
 * Test helper to test async functions to throw
 * expected errors
 * @param fn
 * @param message
 * @returns {Promise<void>}
 */
export const expectThrowAsync = async ({ fn, message }) => {
  try {
    await fn()
    throw new Error('Expected function to throw an Error')
  }
  catch (e) {
    expect(e.message).toEqual(message)
  }
}
