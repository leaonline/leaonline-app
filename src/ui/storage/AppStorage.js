export const AppStorage = {}

const storageKey = Meteor.settings.public.app.storageKey
const storage = window.localStorage

AppStorage.set = (key, value) => {
  const fullKey = `${storageKey}/${key}`
  storage.setItem(fullKey, JSON.stringify(value))
}

AppStorage.get = (key) => {
  const fullKey = `${storageKey}/${key}`
  return storage.getItem(fullKey)
}
