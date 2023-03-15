import { loadProgressDoc } from '../screens/map/loadProgressData'
import { Log } from '../infrastructure/Log'

/**
 * Contains the users' progress and competencies
 * for unitSets of given fields.
 */
export const UserProgress = {
  name: 'userProgress'
}

const debug = Log.create(UserProgress.name, 'debug')

UserProgress.collection = () => {
  throw new Error(`Collection ${UserProgress.name} not initialized`)
}

UserProgress.update = ({ fieldId, unitSetDoc }) => {
  const progressDoc = UserProgress.collection().findOne({ fieldId })

  // there might be the situation where no progressDoc is available
  // for example on the first unitSet story complete on a new field
  // where the doc yet has to be created on the server and fetched
  if (!progressDoc) {
    return
  }

  const unitSetId = unitSetDoc._id

  // if we found a unit set, then we only update the data at the given index
  // otherwise push a completely new entry to the unitSets list

  const unitSets = progressDoc.unitSets ?? {}
  unitSets[unitSetId] = unitSetDoc

  UserProgress.collection().update({ _id: progressDoc._id }, { $set: unitSets })
  Log.print(UserProgress.collection().findOne({ fieldId }))
}

UserProgress.fetchFromServer = async ({ fieldId }) => {
  debug('fetchFromServer for', { fieldId })
  const progressDoc = fieldId && await loadProgressDoc(fieldId)
  if (!progressDoc) { return }

  const query = { _id: progressDoc._id }
  const collection = UserProgress.collection()
  debug('fetchFromServer query', query)

  if (collection.find(query).count() === 0) {
    debug('fetchFromServer collection insert')
    collection.insert(progressDoc)
  }
  else {
    debug('fetchFromServer collection update')
    collection.update(query, { $set: progressDoc })
  }

  const cursor = collection.find({ _id: progressDoc._id })

  if (cursor.count() === 0) {
    throw new Error(`UserProgress.fetchFromServer: Expected progress document for _id ${progressDoc._id}`)
  }

  return cursor.fetch()[0]
}

UserProgress.get = async ({ fieldId }) => {
  debug('get', { fieldId })
  if (!fieldId) { return }

  let doc = UserProgress.collection().findOne({ fieldId })

  if (!doc) {
    debug('get found no doc by field, try to fetch from server')
    doc = await UserProgress.fetchFromServer({ fieldId })
  }

  debug('got doc', !!doc)
  return doc
}
