import { getUsersCollection } from '../collections/getUsersCollection'

export const onAccountLoginHandler = function ({ user }) {
  const userId = user._id
  const lastLogin = new Date()
  getUsersCollection().update(userId, { $set: { lastLogin } })
}
