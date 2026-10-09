import { createRepository } from '../createRepository'

/**
 * We store collections in memory. They should no be persisted.
 * @private
 */
const collections = createRepository()

/**
 * Checks, whether a collection is registered by name without
 * returning a reference to it.
 * @param name {string}
 * @return {boolean}
 */
export const collectionExists = name => collections.has(name)

/**
 * Registers a collection that can be accessed anywhere via
 * `getCollection`. Can register one collection per name once.
 * @param name {string}
 * @param collection {LeaCollection}
 * @returns {LeaCollection}
 */
export const addCollection = (name, collection) => collections.add(name, collection)

/**
 * returns a collection by name or undefined if not found by name
 * @param name {string}
 * @returns {LeaCollection|undefined}
 */
export const getCollection = (name) => collections.get(name)
