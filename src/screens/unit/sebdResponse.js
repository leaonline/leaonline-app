import { callMeteor } from '../../meteor/call'

export const sendResponse = async ({ responseDoc }) => {
  return await callMeteor({
    name: 'response.methods.submit',
    args: responseDoc
  })
}
