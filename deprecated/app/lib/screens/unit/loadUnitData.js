import { callMeteor } from '../../meteor/call'
import { Config } from '../../env/Config'

export const loadUnitData = async (unitSet) => {
  if (!unitSet) {
    throw new Error('No unitSet is selected in loadUnitData')
  }

  const result = await callMeteor({
    name: Config.methods.getUnitData,
    args: { unitSetId: unitSet._id }
  })

  if (!result) {
    throw new Error(`No data received for unit set ${unitSet._id} in loadUnitData`)
  }

  return result
}
