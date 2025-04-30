import { createContextStorage } from './createContextStorage'
import { collectionNotInitialized } from './collectionNotInitialized'

export const Field = {
  name: 'field',
  isLocal: false
}

Field.collection = collectionNotInitialized(Field)

Field.storage = createContextStorage(Field)

Field.init = async () => {
  return Field.storage.loadIntoCollection()
}
