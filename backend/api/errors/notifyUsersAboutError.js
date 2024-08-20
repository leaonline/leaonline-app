import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'

const appName = Meteor.settings.app.name
const { notify, replyTo, from } = Meteor.settings.email

/**
 * Sends a notification to all registered listeners.
 * @param error
 * @param type
 * @return {Promise<Awaited<unknown>[]>}
 */
export const notifyUsersAboutError = (error, type) => {
  if (!notify?.length || typeof error !== 'object' || error === null) {
    return Promise.resolve()
  }

  const html = getHtml(error)

  return Promise.all(notify.map(address => {
    return Email.sendAsync({
      to: address,
      subject: `${appName} (${type}) [error]: ${error.message}`,
      replyTo: replyTo,
      from: from,
      html
    })
  }))
}

/** @private */
const getHtml = (error) => {
  const errorStr = JSON.stringify(error, null, 2)
  const source = `<pre><code>${errorStr}</code></pre>`
  return `<html lang="en"><body>${source}</body></html>`
}
