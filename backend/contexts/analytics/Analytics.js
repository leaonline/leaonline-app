import { getCollection } from '../../api/utils/getCollection'
import { Random } from 'meteor/random'
import { createLog } from '../../infrastructure/log/createLog'

export const Analytics = {
  name: 'analytics'
}

Analytics.schema = {
  timestamp: Date,
  userId: String,
  type: String,
  name: String,
  message: String,
  details: {
    type: Object,
    blackbox: true
  }
}

const log = createLog(Analytics)

Analytics.separator = '~'

Analytics.methods = {}

Analytics.methods.send = {
  name: 'analytics.methods.send',
  schema: {
    logs: Array,
    'logs.$': String
  },
  run: async function ({ logs }) {
    const { userId } = this

    const docs = logs.map(line => {
      const [timestamp, typeAndName, message, ...rest] = line.split(Analytics.separator)
      const [type, nameUncleaned] = typeAndName.split(' ')
      const name = nameUncleaned.replace(/[[\]:]+/g, '')
      const _id = Random.id()
      const details = rest.length === 1
        ? { content: rest[0] }
        : { content: rest }
      return { _id, timestamp, userId, type, name, message, details }
    })

    const rawCollection = getCollection(Analytics.name).rawCollection()
    const insertedDocs = await rawCollection.insertMany(docs)

    log('inserted', insertedDocs.insertedIds)
    return insertedDocs.insertedIds
  }
}
