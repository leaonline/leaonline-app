import { getUsersCollection } from '../collections/getUsersCollection'

/**
 * A drop-in function to publish a user's default fields.
 * By default, it prevents publishing sensitive fields, such as
 * emails, services and device.
 * @return {Mongo.Cursor|undefined}
 */
export const publishDefaultAccountFields = async function () {
  const { userId } = this

  // skip this for non-logged in users
  if (!userId) return this.ready()

  return getUsersCollection().find(userId, { fields: { emails: 0, services: 0, device: 0 } })
}
