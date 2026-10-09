import { Mongo } from '@meteorrn/core'
import { LeaCollection } from './collections/LeaCollection'
import { addCollection } from './collections/collections'
import { Log } from './Log'

const log = Log.create('createCollection')

/**
 *
 * @param name
 * @param isLocal
 * @return {LeaCollection}
 */
export const createCollection = ({ name, isLocal }) => {
  log(name, { isLocal })
  const mongoCollection = isLocal
    ? new Mongo.Collection(null)
    : new Mongo.Collection(name)

  if (isLocal) mongoCollection._name = name

  const collection = new LeaCollection({ name, collection: mongoCollection, isLocal })

  log(name, ': initial docs =>', collection.find().count())

  addCollection(name, collection)
  return collection
}
