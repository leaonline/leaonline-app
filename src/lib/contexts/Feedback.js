import { createContextStorage } from './createContextStorage'

export const Feedback = {
  name: 'feedback',
  isLocal: true
}

Feedback.getFallbackDoc = () => ({
  threshold: 0,
  isFallback: true,
  phrases: ['feedback.fallback'] // requires i18n
})

Feedback.collection = () => {
  throw new Error('is not initialized')
}

Feedback.storage = createContextStorage(Feedback)

Feedback.init = async () => {
  return Feedback.storage.loadIntoCollection()
}
