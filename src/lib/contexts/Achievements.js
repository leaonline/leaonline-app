import { createContextStorage } from './createContextStorage'

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

Achievements.collection = () => {
  throw new Error(`Collection ${Achievements.name} not initialized`)
}

Achievements.storage = createContextStorage(Achievements)

Achievements.init = async () => {
  return Achievements.storage.loadIntoCollection()
}
