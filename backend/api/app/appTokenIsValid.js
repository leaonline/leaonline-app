import { Meteor } from 'meteor/meteor'
import { SHA256 } from 'meteor/sha'

export const appTokenIsValid = ((src) => {
  const appToken = SHA256(src)
  return (token) => token === appToken
})(Meteor.settings.app.token)
