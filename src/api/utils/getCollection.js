import { Mongo } from 'meteor/mongo'

/**
 * Access (persistent; non-local; named) Mongo.Collection by name
 * @category api
 * @module getCollection
 * @param name {string}
 * @return {Mongo.Collection|undefined}
 */
export const getCollection = name => Mongo.Collection.get(name)
