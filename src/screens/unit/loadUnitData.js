import { callMeteor } from '../../meteor/call'
import { Log } from '../../infrastructure/Log'
import { Config } from '../../env/Config'

const log = Log.create('loadUnitData', 'debug')

export const loadUnitData = async (unitSet) => {
  if (!unitSet) {
    throw new Error('No unitSet is selected')
  }

  const result = await callMeteor({
    name: Config.methods.getUnitData,
    args: { unitSetId: unitSet._id },
  })

  if (!result) {
    throw new Error('No data received')
  }

  return result
}
