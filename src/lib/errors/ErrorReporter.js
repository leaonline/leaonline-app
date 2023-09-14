import { Config } from '../env/Config'
import { callMeteor } from '../meteor/call'
import { normalizeError } from './normalizeError'
import { Log } from '../infrastructure/Log'

export const ErrorReporter = {}

ErrorReporter.send = async ({ error, isFatal, stack }) => {
  const errorDoc = normalizeError({ error, stackLength: 3, stack })
  errorDoc.isFatal = isFatal
  Log.debug('send error doc', errorDoc)
  return callMeteor({
    name: Config.methods.sendError,
    args: errorDoc,
    failure: Log.error,
    success: () => Log.debug('error sent')
  })
}
