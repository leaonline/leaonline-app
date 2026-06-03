/* global btoa atob */
import { EJSON } from 'meteor/ejson'
import { simpleHash } from '../../../../utils/simpleHash'

/**
 * Keeps responses in a storage (Storage API).
 */
export class ResponseCache {
  static create (storage, options) {
    return new ResponseCache(storage, options)
  }

  constructor (storage, options = {}) {
    this.storage = storage
    this.getKey = options.getKey || getKey
    this.encode = options.encode || encB64
    this.decode = options.decode || decB64
  }

  save (responseData) {
    const key = this.getKey(responseData)
    const value = EJSON.stringify(responseData)
    const b64Value = this.encode(value)
    this.storage.setItem(key, b64Value)
  }

  load (responseData) {
    const key = this.getKey(responseData)
    const value = this.storage.getItem(key)
    return value && EJSON.parse(this.decode(value))
  }

  clear (responseData) {
    const key = this.getKey(responseData)
    // no need to clear items that do not exist
    if (!this.storage.getItem(key)) {
      return true
    }

    this.storage.removeItem(key)
    return !this.storage.getItem(key)
  }

  flush () {
    const self = this
    // custom storage implementations may use getAll to return all items,
    // otherwise we assume it's a simple key-value store, and we iterate over keys
    // which is the case for localStorage and sessionStorage
    const items = self.storage?.getAll
      ? self.storage.getAll()
      : { ...self.storage }
    Object.entries(items).forEach(([key, value]) => {
      if (key.includes('rc-')) {
        console.warn('[ResponseCache]: delete zombie entry', key, value)
        self.storage.removeItem(key)
      }
    })
  }

  all ({ sessionId } = {}) {
    const self = this
    const items = self.storage?.getAll
      ? self.storage.getAll()
      : { ...self.storage }
    const data = {}
    Object.entries(items).forEach(([key, value]) => {
      if (key.startsWith('rc-')) {
        const loaded = EJSON.parse(this.decode(value))
        if (!sessionId || sessionId === loaded.sessionId) {
          data[key] = loaded
        }
      }
    })
    return data
  }
}

const encB64 = x => btoa(x)
const decB64 = y => atob(y)

function getKey ({ sessionId, unitId, page, contentId }) {
  const hash = simpleHash(`${sessionId}-${unitId}-${page}-${contentId}`)
  return `rc-${hash}`
}
