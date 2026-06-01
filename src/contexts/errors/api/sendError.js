// /////////////////////////////////////////////////////////////////////////////
// CLIENT-ONLY
// /////////////////////////////////////////////////////////////////////////////

/**
 * Normalizes an error and sends it to the server for saving.
 * @locus client
 * @param error
 * @param isResponse
 * @param userId
 * @param template
 * @param prepare
 * @param receive
 * @param failure
 * @param success
 * @return {*}
 */
export const sendError = async ({ error, isResponse, userId, template, prepare, receive, failure, success }) => {
  import { Meteor } from 'meteor/meteor'
  import { Errors } from '../Errors'
  import { normalizeError } from './normalizeError'
  import { callMethod } from '../../../infrastructure/methods/callMethod'
  import { getOSInfo } from '../../../ui/utils/getOSInfo'

  if (isResponse) {
    return console.error(error)
  }

  let detected

  try {
    const result = await getOSInfo()
    detected = result.detected
  }
  catch (e) {
    detected = {
      platform: window.navigator.platform,
      userAgent: window.navigator.userAgent
    }
  }

  const normalizedError = normalizeError({
    error: error,
    template: template,
    browser: detected,
    userId: userId || Meteor.userId()
  })

  return callMethod({
    name: Errors.methods.create,
    args: normalizedError,
    prepare: prepare,
    receive: receive,
    failure: err => {
      console.error('could not send error')
      console.error(err)
      if (failure) failure()
    },
    success: () => {
      console.error('error reported to server: ', normalizedError.message)
      if (success) success()
    }
  })
}
