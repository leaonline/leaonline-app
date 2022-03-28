import { createRepository } from '../createRepository'

/**
 * We store collections in memory. They should no be persisted.
 */
const collections = createRepository()

export const addCollection = (name, collection) => collections.add(name, collection)

export const getCollection = (name) => collections.get(name)
