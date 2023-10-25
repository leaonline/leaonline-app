import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'

const appName = Meteor.settings.app.name
const { notify, replyTo, from } = Meteor.settings.email

export const notifyUsersAboutError = (error, type) => {
  if (!notify?.length || typeof error !== 'object' || error === null) {
    return
  }

  const html = getHtml(error)

  notify.forEach(address => {
    Email.send({
      to: address,
      subject: `${appName} (${type}) [error]: ${error.message}`,
      replyTo: replyTo,
      from: from,
      html
    })
  })
}

const getHtml = (error) => {
  const errorStr = JSON.stringify(error, null, 2)
  const source = `<pre><code>${errorStr}</code></pre>`
  return `<html lang="en"><body>${source}</body></html>`
}
