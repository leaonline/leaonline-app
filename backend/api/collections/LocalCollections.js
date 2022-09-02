const map = new Map()

/**
 * Repository to manage and access local (unnamed; non-persistent) Mongo Collections
 * by name.
 *
 * @module
 */
export const LocalCollections = {}

/**
 * Adds a collection by given name to the repository
 * @param name {string}
 * @param collection {Mongo.Collection}
 */
LocalCollections.add = (name, collection) => {
  if (map.has(name)) {
    throw new Error(`Collection "${name}" already exists`)
  }
  map.set(name, collection)
}

/**
 * Get a local Mongo Collection by name
 * @param name {string}
 * @return {Mongo.Collection|undefined}
 */
LocalCollections.get = name => map.get(name)
