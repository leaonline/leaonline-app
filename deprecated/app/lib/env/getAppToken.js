import { SHA256 } from '@meteorrn/core/lib/sha256'
import { Config } from './Config'

export const getAppToken = ((token) => {
  const hashed = SHA256(token)
  return () => hashed
})(Config.appToken)
