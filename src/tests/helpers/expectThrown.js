import { expect } from 'chai'

/**
 * Helper fn to assist with expecting errors thrown from
 * async function contexts.
 * @param fn
 * @param name
 * @param message
 * @param reason
 * @param details
 * @return {Promise<void>}
 */
export const expectThrown = async ({ fn, name, message, reason, details }) => {
  try {
    await fn()
    expect.fail('Expected fn to throw!')
  }
  catch (e) {
    if (name) expect(e.error ?? e.name).to.include(name)
    if (message) expect(e.message).to.include(message)
    if (reason) expect(e.reason).to.include(reason)
    if (details) expect(e.details).to.deep.equal(details)
  }
}
