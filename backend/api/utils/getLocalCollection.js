import { LocalCollections } from '../collections/LocalCollections'

/**
 * Access (non-persistent; local; unnamed) Mongo.Collection by name
 * @method
 * @param name {string}
 * @return {Mongo.Collection|undefined}
 */
export const getLocalCollection = name => LocalCollections.get(name)
