import { hasProp } from '../utils/hasProp'

export const isBackendUser = (user = {}) => {
  const leaService = user.services?.lea
  if (!leaService) { return false }
  return (
    hasProp(leaService, 'id') &&
    hasProp(leaService, 'accessToken')
  )
}
