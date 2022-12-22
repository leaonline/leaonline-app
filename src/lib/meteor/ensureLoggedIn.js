import Meteor from '@meteorrn/core'

/**
 * throws if not logged in
 * @throws {Error} when not logged in
 * @return {object} the user object if logged-in
 */
export const ensureLoggedIn = () => {
  const user = Meteor.user()

  if (!user) { throw new Error('notLoggedIn') }

  return user
}
