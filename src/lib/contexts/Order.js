import { createContextStorage } from './createContextStorage'

export const Order = {
  name: 'order'
}

Order.collection = () => {
  throw new Error(`Collection ${Order.name} not yet initialized`)
}

Order.storage = createContextStorage(Order)

Order.init = async () => {
  return Order.storage.loadIntoCollection()
}
