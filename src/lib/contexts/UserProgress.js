import { loadProgressDoc } from '../screens/map/loadProgressData'
import { Log } from '../infrastructure/Log'
import { collectionNotInitialized } from './collectionNotInitialized'
import { check } from '../schema/check'
import { createSchema } from '../schema/createSchema'

/**
 * Contains the users' progress and competencies
 * for unitSets of given fields.
 */
export const UserProgress = {
  name: 'userProgress'
}

const debug = Log.create(UserProgress.name, 'debug')

/**
 *
 * @type {function}
 * @return {LeaCollection}
 */
UserProgress.collection = collectionNotInitialized(UserProgress)

const progressDocSchema = createSchema({
  _id: String,
  dimensionId: String,
  progress: {
    type: Number,
    min: 0
  },
  competencies: {
    type: Number,
    min: 0
  }
})

/**
 * Updates the current user's progress for the given
 * field and unit set.
 * @async
 * @function
 * @param fieldId {string}
 * @param unitSetDoc {object} a minimalistic version of the unit set document
 * @param unitSetDoc._id {string} _id of the unitSet
 * @param unitSetDoc.dimensionId {string} _id of the related dimension
 * @param unitSetDoc.progress {number} progress in units/steps
 * @param unitSetDoc.competencies {number} achieved competencies
 * @return {Promise<boolean>} true if update was done on collection, false if skipped
 */
UserProgress.update = async ({ fieldId, unitSetDoc }) => {
  const collection = UserProgress.collection()
  const progressDoc = fieldId && collection.findOne({ fieldId })

  // there might be the situation where no progressDoc is available
  // for example on the first unitSet story complete on a new field
  // where the doc yet has to be created on the server and fetched
  if (!progressDoc) {
    return false
  }

  check(unitSetDoc, progressDocSchema)
  const unitSetId = unitSetDoc._id

  // if we found a unit set, then we only update the data at the given index
  // otherwise push a completely new entry to the unitSets list
  const unitSets = progressDoc.unitSets ?? {}
  unitSets[unitSetId] = unitSetDoc

  await collection.update(progressDoc._id, { $set: unitSets })
  return true
}

/**
 * Fetches the current progress doc from server and either inserts
 * or updates, depending on whether it locally exists.
 * @param fieldId {string}
 * @return {Promise<object|undefined>}
 */
UserProgress.fetchFromServer = async ({ fieldId }) => {
  debug('fetchFromServer for', { fieldId })
  const progressDoc = fieldId && await loadProgressDoc(fieldId)
  if (!progressDoc) { return }

  const { _id, ...updateDoc } = progressDoc
  const query = { _id }
  const collection = UserProgress.collection()
  debug('fetchFromServer query', query)

  if (collection.find(query).count() === 0) {
    debug('fetchFromServer collection insert')
    await collection.insert(progressDoc)
  }
  else {
    debug('fetchFromServer collection update')
    await collection.update(_id, { $set: updateDoc })
  }

  return collection.findOne({ _id })
}

UserProgress.get = async ({ fieldId } = {}) => {
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
