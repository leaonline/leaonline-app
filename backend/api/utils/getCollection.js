import { Mongo } from 'meteor/mongo'

/**
 * Access (persistent; non-local; named) Mongo.Collection by name
 * @param name {string}
 * @return {Mongo.Collection|undefined}
 * @module
 */
export const getCollection = name => Mongo.Collection.get(name)
