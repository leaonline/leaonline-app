import { AppState } from '../../state/AppState'
import { callMeteor } from '../../meteor/call'
import { Log } from '../../infrastructure/Log'

const log = Log.create('loadUnitData')

export const loadUnitData = async (debug) => {
  const unitSet = await AppState.unitSet()

  if (!unitSet) { return null }

  const result = await callMeteor({
    name: 'content.methods.unit',
    args: { unitSetId: unitSet._id }
  })
  if (debug) log({ result })
  if (!result) { return null }

  return result
}
