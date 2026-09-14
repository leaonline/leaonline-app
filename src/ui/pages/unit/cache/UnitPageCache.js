import { simpleHash } from '../../../../utils/simpleHash'

/**
 * Keeps responses in a storage (Storage API).
 */

export class UnitPageCache {
  static create (storage) {
    return new UnitPageCache(storage)
  }

  constructor (storage) {
    this.storage = storage
  }

  save ({ sessionId, unitId }, page) {
    const key = getKey({ sessionId, unitId })
    this.storage.setItem(key, page)
  }

  load ({ sessionId, unitId }) {
    const key = getKey({ sessionId, unitId })
    const value = this.storage.getItem(key)
    return Number.parseInt(value, 10)
  }

  clear (pageData) {
    const key = getKey(pageData)
    return this.storage.removeItem(key)
  }
}

function getKey ({ sessionId, unitId }) {
  const hash = simpleHash(`${sessionId}-${unitId}`)
  return `upc-${hash}`
}
