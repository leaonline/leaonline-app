import { Meteor } from 'meteor/meteor'
import { EJSON } from 'meteor/ejson'
import { Email } from 'meteor/email'

const appName = Meteor.settings.app.name
const { notify, replyTo, from } = Meteor.settings.email

export const notifyUsersAboutError = (error, type) => {
  if (!notify?.length || !error) return

  notify.forEach(address => {
    Email.send({
      to: address,
      subject: `${appName} (${type}) [error]: ${error.message}`,
      replyTo: replyTo,
      from: from,
      text: EJSON.stringify(error, null, 2)
    })
  })
}
