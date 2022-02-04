import Meteor from '@meteorrn/core'

/**
 * Throws, if not connected to the backend
 * @throws Error
 */
export const ensureConnected = () => {
  const status = Meteor.status()

  if (!status.connected) {
    throw new Error('notConnected')
  }

  return status
}
