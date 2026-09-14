import Meteor from '@meteorrn/core'
import { ConnectionError } from '../errors/ConnectionError'

/**
 * Throws, if not connected to the backend
 * @throws Error
 */
export const ensureConnected = () => {
  const status = Meteor.status()

  if (!status.connected) {
    throw new ConnectionError('notConnected')
  }

  return status
}
