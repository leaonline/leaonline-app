import { createContextStorage } from './createContextStorage'
import { collectionNotInitialized } from './collectionNotInitialized'

export const Feedback = {
  name: 'feedback',
  isLocal: true
}

Feedback.getFallbackDoc = () => ({
  threshold: 0,
  isFallback: true,
  phrases: ['feedback.fallback'] // requires i18n
})

Feedback.collection = collectionNotInitialized(Feedback)

Feedback.storage = createContextStorage(Feedback)

Feedback.init = async () => {
  return Feedback.storage.loadIntoCollection()
}
