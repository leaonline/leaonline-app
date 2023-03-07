import { createContextStorage } from './createContextStorage'

export const Achievements = {
  name: 'achievements'
}

Achievements.trophies = {
  bronze: {
    src: require('../assets/images/trophy-bronze.png')
  },
  silver: {
    src: require('../assets/images/trophy-silver.png')
  },
  gold: {
    src: require('../assets/images/trophy-gold.png')
  }
}

Achievements.collection = () => {
  throw new Error(`Collection ${Achievements.name} not initialized`)
}

Achievements.storage = createContextStorage(Achievements)

Achievements.init = async () => {
  return Achievements.storage.loadIntoCollection()
}
