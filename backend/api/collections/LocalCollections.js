const map = new Map()

export const LocalCollections = {}

LocalCollections.add = (name, collection) => {
  if (map.has(name)) throw new Error(`${name} already exists`)
  map.set(name, collection)
}

LocalCollections.get = name => map.get(name)
