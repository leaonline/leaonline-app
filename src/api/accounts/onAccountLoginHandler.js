import { getUsersCollection } from '../collections/getUsersCollection'

/**
 * Adds a lastLogin to the current user
 * @param user
 */
export const onAccountLoginHandler = async function ({ user }) {
  const userId = user._id
  const lastLogin = new Date()
  await getUsersCollection().updateAsync(userId, { $set: { lastLogin } })
}
