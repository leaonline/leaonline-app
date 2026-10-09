import { callMeteor } from '../../meteor/call'
import { Config } from '../../env/Config'

export const loadTerms = async () => {
  const args = Config.methods.getTerms
  return await callMeteor(args)
}
