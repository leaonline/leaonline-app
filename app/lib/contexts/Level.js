import { createContextStorage } from './createContextStorage'
import { collectionNotInitialized } from './collectionNotInitialized'

export const Level = {
  name: 'level',
  isLocal: false
}

Level.collection = collectionNotInitialized(Level)

Level.storage = createContextStorage(Level)

Level.init = async () => {
  return Level.storage.loadIntoCollection()
}
