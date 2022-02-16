import { Meteor } from 'meteor/meteor'
import { DDP } from 'meteor/ddp-client'
import { getCollection } from '../utils/getCollection'

const { url } = Meteor.settings.remotes.content
let connection = null

const ensureConnected = () => {
  if (!connection || !connection.status().connected) {
    throw new Error('notConnected')
  }
}

export const ContentServer = {}

ContentServer.schema = () => ({
  name: {
    type: String,
    allowedValues: ['field']
  },
  ids: {
    type: Array,
    optional: true
  },
  'ids.$': String
})

ContentServer.init = () => {
  connection = DDP.connect(url)
}

ContentServer.get = ({ name, ids }) => {
  ensureConnected()

  const collection = getCollection(name)

  if (!collection) {
    throw new Error(`No collection found for ${name}`)
  }

  const query = {}

  if (ids?.length) {
    query._id = { _id: { $in: ids } }
  }

  return collection.find(query).fetch()
}
