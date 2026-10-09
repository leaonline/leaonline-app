import { Log } from '../infrastructure/Log'
import { ErrorReporter } from '../errors/ErrorReporter'
import ErrorUtils from 'react-native/Libraries/vendor/core/ErrorUtils'

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
