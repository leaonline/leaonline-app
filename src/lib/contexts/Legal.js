import { createContextStorage } from './createContextStorage'

export const Legal = {
  name: 'legal'
}

Legal.collection = () => {
  throw new Error(`Collection ${Legal.name} is not initialized`)
}

Legal.storage = createContextStorage(Legal)

Legal.init = async () => {
  return Legal.storage.loadIntoCollection()
}
