import { createContextStorage } from './createContextStorage'

export const Field = {
  name: 'field',
  isLocal: false
}

Field.collection = () => {
  throw new Error('is not initialized')
}

Field.storage = createContextStorage(Field)

Field.init = async () => {
  return Field.storage.loadIntoCollection()
}
