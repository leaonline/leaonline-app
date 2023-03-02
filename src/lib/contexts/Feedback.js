import { createContextStorage } from './createContextStorage'

export const Feedback = {
  name: 'feedback',
  isLocal: true
}

Feedback.collection = () => {
  throw new Error('is not initialized')
}

Feedback.storage = createContextStorage(Feedback)

Feedback.init = async () => {
  return Feedback.storage.loadIntoCollection()
}
