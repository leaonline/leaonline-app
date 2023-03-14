import { loadProgressDoc } from '../screens/map/loadProgressData'

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

  if (collection.find(query).count() === 0) {
    collection.insert(progressDoc)
  }
  else {
    collection.update(query, { $set: progressDoc })
  }
}
