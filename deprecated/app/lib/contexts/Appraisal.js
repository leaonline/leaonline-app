import { Config } from '../env/Config'
import { callMeteor } from '../meteor/call'

export const Appraisal = {
  name: 'appraisal'
}

Appraisal.sendUnitSet = async ({ unitSetId, response }) => {
  return callMeteor({
    name: Config.methods.sendUnitSetAppraisal,
    args: { unitSetId, response }
  })
}
