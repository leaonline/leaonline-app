import { AppState } from '../../state/AppState'
import { callMeteor } from '../../meteor/call'

export const loadUnitData = async () => {
  const unitSet = await AppState.unitSet()

  if (!unitSet) { return null }

  const result = await callMeteor({
    name: 'content.methods.unit',
    args: { unitSetId: unitSet._id }
  })

  if (!result) { return null }

  return result
}
