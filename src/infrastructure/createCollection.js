import { Mongo } from '@meteorrn/core'
import { addCollection } from './collections/collections'
import { Log } from './Log'

const log = Log.create('createCollection')

export const createCollection = ({ name, isLocal }) => {
  log(name, { isLocal })
  const collection = isLocal
    ? new Mongo.Collection(null)
    : new Mongo.Collection(name)

  if (isLocal) collection._name = name

  log('intial docs', collection.find().count())

  addCollection(name, collection)
  return collection
}
