import { getCollection } from '../../api/utils/getCollection'
import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { createLog } from '../../infrastructure/log/createLog'

/**
 * Progress represents a user's progress for a given field.
 *
 * @category contexts
 * @namespace
 */
export const Progress = {
  name: 'progress'
}
const log = createLog(Progress)

Progress.schema = {
  userId: String,
  fieldId: String,

  /**
   * [
   *   {
   *     _id: '01234567890',
   *     progress: 5,
   *     competencies: 3,
   *     complete: true
   *   }
   * ]
   */

  unitSets: {
    type: Array
  },
  'unitSets.$': {
    type: Object
  },

  'unitSets.$._id': {
    type: String
  },
  'unitSets.$.progress': {
    type: Number,
    defaultValue: 0
  },
  'unitSets.$.competencies': {
    type: Number,
    defaultValue: 0
  },
  'unitSets.$.complete': {
    type: Boolean,
    defaultValue: false
  }
}

Progress.create = ({ userId, fieldId, unitSetId, progress, competencies, complete }) => {
  log('create', { userId, fieldId, unitSetId, progress, competencies, complete })
  const unitSets = [{ _id: unitSetId, progress, competencies, complete }]
  return getCollection(Progress.name).insert({ userId, fieldId, unitSets })
}

Progress.update = ({ userId, fieldId, unitSetId, progress, competencies, complete }) => {
  log('update', { userId, fieldId, unitSetId, progress, competencies, complete })
  const ProgressCollection = getCollection(Progress.name)
  const progressDoc = ProgressCollection.findOne({ userId, fieldId })

  if (!progressDoc) {
    return Progress.create({ userId, fieldId, unitSetId, progress, competencies, complete })
  }

  const unitSetDoc = { _id: unitSetId, progress, competencies, complete }
  const index = progressDoc.unitSets.findIndex(entry => entry._id === unitSetId)

  // if we found a unit set, then we only update the data at the given index
  // otherwise push a completely new entry to the unitSets list
  const updateDoc = index > -1
    ? {
        $set: {
          [`unitSets.${index}`]: unitSetDoc
        }
      }
    : {
        $push: {
          unitSets: unitSetDoc
        }
      }

  log('unit set', { unitSetDoc, index, updateDoc })
  return ProgressCollection.update(progressDoc._id, updateDoc)
}

Progress.methods = {}

Progress.methods.get = {
  name: 'progress.methods.get',
  schema: {
    fieldId: String
  },
  run: onServerExec(function () {
    return function ({ fieldId }) {
      const { userId } = this
      return getCollection(Progress.name).findOne({ userId, fieldId })
    }
  })
}
