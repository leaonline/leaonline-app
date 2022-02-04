import Meteor from '@meteorrn/core'

/**
 * Returns true if there is either a user object or a userId present
 * @return {any}
 */
export const loggedIn = () => Meteor.user() || Meteor.userId()
