import { callMeteor } from '../../meteor/call'

/**
 * Completes a current unit and returns the next route.
 * Attempts to sync with the server, too.
 *
 *
 * @return {Promise<String>} resolves to a route name
 */
export const completeUnit = async ({ sessionDoc }) => {
  const hasNext = await callMeteor({
    name: 'session.methods.update',
    args: {
      sessionId: sessionDoc._id
    }
  })

  return hasNext
    ? 'Unit'
    : 'Complete'
}