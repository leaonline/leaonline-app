import { getUsersCollection } from '../collections/getUsersCollection'

export const publishDefaultAccountFields = function () {
  const { userId } = this

  // skip this for non-logged in users
  if (!userId) return this.ready()

  return getUsersCollection().find(userId, { fields: { emails: 0, services: 0, device: 0 } })
}
