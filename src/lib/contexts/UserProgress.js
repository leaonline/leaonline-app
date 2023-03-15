import { loadProgressDoc } from '../screens/map/loadProgressData'
import { Log } from '../infrastructure/Log'

/**
 * Contains the users' progress and competencies
 * for unitSets of given fields.
 */
export const UserProgress = {
  name: 'userProgress'
}

UserProgress.collection = () => {
  throw new Error(`Collection ${UserProgress.name} not initialized`)
}

UserProgress.update = async ({ fieldId }) => {
  const progressDoc = fieldId && await loadProgressDoc(fieldId)
  if (!progressDoc) { return }

  const query = { _id: progressDoc._id }
  const collection = UserProgress.collection()

  Log.print(progressDoc)
  if (collection.find(query).count() === 0) {
    collection.insert(progressDoc)
  }
  else {
    collection.update(query, { $set: progressDoc })
  }
}

UserProgress.get = async ({ fieldId }) => {
  if (!fieldId) { return }

  let doc = UserProgress.collection().findOne({ fieldId })

  if (!doc) {
    doc = await UserProgress.update({ fieldId })
  }

  return doc
}