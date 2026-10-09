import { hasProp } from '../utils/hasProp'

/**
 * Checks, whether a user appears to be
 * a user from the overall lea. backend system.
 * @param user
 * @return {boolean}
 */
export const isBackendUser = (user = {}) => {
  const leaService = user.services?.lea
  if (!leaService) { return false }
  return (
    hasProp(leaService, 'id') &&
    hasProp(leaService, 'accessToken')
  )
}
