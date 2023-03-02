import { createContextStorage } from './createContextStorage'

export const Dimension = {
  name: 'dimension',
  isLocal: false
}

Dimension.collection = () => {
  throw new Error('is not initialized')
}

Dimension.storage = createContextStorage(Dimension)
