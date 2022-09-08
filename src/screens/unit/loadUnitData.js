import { AppState } from '../../state/AppState'
import { callMeteor } from '../../meteor/call'
import { Log } from '../../infrastructure/Log'
import { Config } from '../../env/Config'

const log = Log.create('loadUnitData', 'debug')

export const loadUnitData = async (debug) => {
  const unitSet = await AppState.unitSet()

  if (!unitSet) {
    throw new Error('No unitSet is selected')
  }

  if (debug) log('load with', { unitSet })

  const result = await callMeteor({
    name: Config.methods.getUnitData,
    args: { unitSetId: unitSet._id },
    debug
  })

  if (debug) log({ result })

  if (!result) {
    throw new Error('No data received')
  }

  return result
}
