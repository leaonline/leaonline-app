import { Meteor } from 'meteor/meteor'
import { getCollection } from '../utils/getCollection'

const { url } = Meteor.settings.remotes.content
const connection = DDP.connect(url)

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
}

ContentServer.get = ({ name, ids }) => {
  const collection = getCollection(name)

  if (!collection) {
    throw new Error(`No collection found for ${name}`)
  }

  const query = {}

  if (ids?.length) {
    query._id = { _id: { $in: ids }}
  }

  return collection.find(query).fetch()
}
