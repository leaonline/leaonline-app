import { createContextStorage } from './createContextStorage'
import { collectionNotInitialized } from './collectionNotInitialized'

export const Achievements = {
  name: 'achievements'
}

// FIXME the thresholds should come from the settings/env
Achievements.trophies = {
  silver: {
    src: require('../assets/images/trophy-silver.png'),
    threshold: 0.33
  },
  gold: {
    src: require('../assets/images/trophy-gold.png'),
    threshold: 0.66
  },
  bronze: {
    src: require('../assets/images/trophy-bronze.png'),
    threshold: 0
  }
}

Achievements.collection = collectionNotInitialized(Achievements)
Achievements.storage = createContextStorage(Achievements)

Achievements.init = async () => {
  return Achievements.storage.loadIntoCollection()
}
