import { AppState } from '../../state/AppState'
import { callMeteor } from '../../meteor/call'
import { Log } from '../../infrastructure/Log'
import { Config } from '../../env/Config'

const log = Log.create('loadUnitData')

export const loadUnitData = async (debug) => {
  const unitSet = await AppState.unitSet()

  if (!unitSet) { return null }

  const result = await callMeteor({
    name: Config.methods.getUnit,
    args: { unitSetId: unitSet._id }
  })
  if (debug) log({ result })
  if (!result) { return null }

  return result
}
