/* global ErrorUtils */
import { Log } from '../infrastructure/Log'
import { ErrorReporter } from '../errors/ErrorReporter'

export const initExceptionHandling = async () => {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    if (isFatal) {
      Log.fatal(error)
    }
    else {
      Log.error(error)
    }

    ErrorReporter.send({ error, isFatal }).catch(Log.error)
  })
}
