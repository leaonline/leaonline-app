import * as Font from 'expo-font'
const cache = new Map()

export const fontIsLoaded = name => {
  if (!cache.has(name)) {
    cache.set(name, Font.isLoaded(name))
  }
  return cache.get(name)
}
