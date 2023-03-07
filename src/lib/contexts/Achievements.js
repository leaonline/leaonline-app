import { createContextStorage } from './createContextStorage'

export const Achievements = {
  name: 'achievements'
}

Achievements.trophies = {
  bronze: {
    src: require('../assets/images/trophy-bronze.png'),
    threshold: 0
  },
  silver: {
    src: require('../assets/images/trophy-silver.png'),
    threshold: 0.4
  },
  gold: {
    src: require('../assets/images/trophy-gold.png'),
    threshold: 0.7
  }
}

Achievements.collection = () => {
  throw new Error(`Collection ${Achievements.name} not initialized`)
}

Achievements.storage = createContextStorage(Achievements)

Achievements.init = async () => {
  return Achievements.storage.loadIntoCollection()
}
