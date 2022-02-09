import Meteor from '@meteorrn/core'

/**
 * !!! Do not use within Meteor-related functions!!!
 *
 * Returns the current available user, if any can be found.
 * // TODO return a local copy of the last logged in user in case we are offline
 * @return {any}
 */
export const currentUser = () => {
  return Meteor.user()
}
