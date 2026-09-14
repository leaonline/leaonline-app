import { Scoring } from './Scoring'

const isUndefined = value =>
  value === Scoring.UNDEFINED ||
  value === undefined ||
  value === null ||
  value === ''

/**
 * Checks, whether a given value is an undefined value.
 * Respects recursive structures.
 * @param value
 * @param recursionCache
 * @return {boolean|*}
 */
export const isUndefinedResponse = (value, recursionCache = new Set()) => {
  if (recursionCache.has(value)) {
    return true
  }

  if (isUndefined(value)) {
    return true
  }

  if (!Array.isArray(value)) {
    return false
  }

  recursionCache.add(value)
  return value.every(entry => isUndefinedResponse(entry, recursionCache))
}
