import { createContextStorage } from './createContextStorage'

export const Level = {
  name: 'level',
  isLocal: false
}

Level.collection = () => {
  throw new Error('is not initialized')
}

Level.storage = createContextStorage(Level)

Level.init = async () => {
  return Level.storage.loadIntoCollection()
}
