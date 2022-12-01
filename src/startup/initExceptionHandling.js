/* global ErrorUtils */
import { Log } from '../infrastructure/Log'
import { Config } from '../env/Config'
import { RemoteDDPLogger } from '../infrastructure/log/RemoteDDPLogger'

export const initExceptionHandling = async () => {
  if (Config.log.target) {
    const { active, transport } = Config.log.target

    if (active && transport === 'ddp') {
      Log.setTarget(RemoteDDPLogger)
    }

    // TODO support http
  }
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    if (isFatal) {
      Log.fatal(error)
    }
    else {
      Log.error(error)
    }
  })
}
