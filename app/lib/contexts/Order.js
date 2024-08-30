import { createContextStorage } from './createContextStorage'
import { collectionNotInitialized } from './collectionNotInitialized'

export const Order = {
  name: 'order'
}

Order.collection = collectionNotInitialized(Order)

Order.storage = createContextStorage(Order)

Order.init = async () => {
  return Order.storage.loadIntoCollection()
}
