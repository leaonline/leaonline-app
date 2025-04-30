import { callMeteor } from '../../meteor/call'
import { Config } from '../../env/Config'

export const sendResponse = async ({ responseDoc }) => {
  return await callMeteor({
    name: Config.methods.submitResponse,
    args: responseDoc
  })
}
