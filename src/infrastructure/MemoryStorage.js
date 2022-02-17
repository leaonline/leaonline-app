const data = new Map()

/**
 * A simple in-memory storage for development.
 * Don't use in production unless you are 100% sure what you are doing.
 * All data is lost on reload.
 */
export const MemoryStorage = {}

MemoryStorage.name = 'MemoryStorage'

MemoryStorage.getItem = async key => data.get(key)

MemoryStorage.setItem = async (key, value) => data.set(key, value)

MemoryStorage.remoteItem = async key => data.delete(key)
