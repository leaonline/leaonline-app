import { createContextStorage } from './createContextStorage'
import { collectionNotInitialized } from './collectionNotInitialized'

export const Legal = {
  name: 'legal'
}

Legal.collection = collectionNotInitialized(Legal)

Legal.storage = createContextStorage(Legal)

Legal.init = async () => {
  return Legal.storage.loadIntoCollection()
}
