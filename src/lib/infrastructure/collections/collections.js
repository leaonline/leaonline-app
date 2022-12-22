import { createRepository } from '../createRepository'

/**
 * We store collections in memory. They should no be persisted.
 * @private
 */
const collections = createRepository()

/**
 * Registers a collection that can be accessed anywhere via
 * `getCollection`. Can register one collection per name once.
 * @param name {string}
 * @param collection {*}
 * @returns {*}
 */
export const addCollection = (name, collection) => collections.add(name, collection)

/**
 * returns a collection by name
 * @param name {string}
 * @returns {*|undefined}
 */
export const getCollection = (name) => collections.get(name)
