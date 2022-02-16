import { Mongo } from 'meteor/mongo'
import { createSchema } from './createSchema'
import { createCollectionFactory } from 'meteor/leaonline:collection-factory'
import { LocalCollections } from '../../api/collections/LocalCollections'
import { createLog } from '../log/createLog'

const collectionFactory = createCollectionFactory({
  schemaFactory: createSchema
})

const log = createLog({ name: 'createCollection' })

export const createCollection = ({ name, schema, isLocal }) => {
  log(name, { isLocal: !!isLocal })

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

  return collectionFactory({ name, schema })
}
