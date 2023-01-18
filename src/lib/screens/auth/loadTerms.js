import { callMeteor } from '../../meteor/call'
import { Config } from '../../env/Config'

export const loadTerms = async () => {
  return callMeteor(Config.methods.getTerms)
}
