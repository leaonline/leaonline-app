import { callMeteor } from '../../meteor/call'
import { Log } from '../../infrastructure/Log'
import { Config } from '../../env/Config'

const log = Log.create('completeUnit')

/**
 * Completes a current unit and returns the next route.
 * Attempts to sync with the server, too.
 *
 *
 * @return {Promise<String>} resolves to a route name
 */
export const completeUnit = async ({ sessionDoc }) => {
  const nextUnitId = await callMeteor({
    name: Config.methods.updateSession,
    args: {
      sessionId: sessionDoc._id
    },
    failure: error => Log.error(error)
  })
  log({ nextUnitId })
  return nextUnitId
}
