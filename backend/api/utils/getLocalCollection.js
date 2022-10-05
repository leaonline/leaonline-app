import { LocalCollections } from '../collections/LocalCollections'

/**
 * Access (non-persistent; local; unnamed) Mongo.Collection by name
 * @category api
 * @module getLocalCollection
 * @param name {string}
 * @return {Mongo.Collection|undefined}
 */
export const getLocalCollection = name => LocalCollections.get(name)
