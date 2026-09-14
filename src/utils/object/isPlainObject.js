import { getType } from './getType'

export const isPlainObject = x => {
  if (typeof x !== 'object') return false

  return getType(x) === '[object Object]' && !x.prototype
}
