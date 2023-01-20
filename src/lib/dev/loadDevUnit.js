import { callMeteor } from '../meteor/call'
import { Config } from '../env/Config'

export const loadDevUnit = async (unitId) => {
  if (!unitId) return null

  return callMeteor({
    name: Config.methods.getUnitDev,
    args: { unitId }
  })
}
