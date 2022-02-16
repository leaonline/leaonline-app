import { Mongo } from 'meteor/mongo'
import { createSchema } from './createSchema'
import { LocalCollections } from '../../api/collections/LocalCollections'

export const createCollection = ({ name, schema, isLocal }) => {
  if (isLocal) {
    const existingCollection = LocalCollections.get(name)

    if (existingCollection) {
      return existingCollection
    }

    const collection = new Mongo.Collection(null)
    collection._name = name

    if (schema) {
      const schemaInstance = createSchema(schema)
      collection.attachSchema(schemaInstance)
    }

    LocalCollections.set(name, collection)

    return collection
  }

  throw new Error('not yet implemented')
}
