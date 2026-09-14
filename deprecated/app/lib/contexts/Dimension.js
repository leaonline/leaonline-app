import { createContextStorage } from './createContextStorage'
import { collectionNotInitialized } from './collectionNotInitialized'

export const Dimension = {
  name: 'dimension',
  isLocal: false
}

Dimension.collection = collectionNotInitialized(Dimension)

Dimension.storage = createContextStorage(Dimension)

Dimension.init = async () => {
  return Dimension.storage.loadIntoCollection()
}
