import { getCollection } from '../../api/utils/getCollection'
import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { createLog } from '../../infrastructure/log/createLog'
import { Field } from '../content/Field'
import { onDependencies } from '../utils/onDependencies'
import { onClientExec } from '../../utils/archUtils'

/**
 * Progress represents a user's progress for a given field.
 *
 * @category contexts
 * @namespace
 */
export const Progress = {
  name: 'progress',
  label: 'progress.title',
  icon: 'spinner',
  representative: 'userId',
  useHistory: true,
}
const log = createLog(Progress)

onClientExec(() => {
  Progress.isLocal = true
})

Progress.schema = {
  userId: {
    type: String,
  },
  fieldId: {
    type: String,
    dependency: {
      collection: Field.name,
      field: Field.representative,
    },
  },

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
    type: Array,
  },
  'unitSets.$': {
    type: Object,
  },

  'unitSets.$._id': {
    type: String,
  },
  'unitSets.$.progress': {
    type: Number,
    optional: true,
    defaultValue: 0,
  },
  'unitSets.$.dimensionId': {
    type: String,
    optional: true,
    defaultValue: 0,
  },
  'unitSets.$.competencies': {
    type: Number,
    optional: true,
    defaultValue: 0,
  },
  'unitSets.$.createdAt': {
    type: Date,
    optional: true,
  },
  'unitSets.$.complete': {
    type: Boolean,
    optional: true,
    defaultValue: false,
  },
  'unitSets.$.updatedAt': {
    type: Date,
    optional: true,
  },
  'unitSets.$.completedAt': {
    type: Date,
    optional: true,
  },
}

onServerExec(() => {
  /**
   * Creates a new progress document by given data
   * @param param0 {object}
   * @param param0.userId {string}
   * @param param0.fieldId {string}
   * @param param0.unitSetId {string}
   * @param param0.dimensionId {string}
   * @param param0.progress {number}
   * @param param0.competencies {number}
   * @param param0.complete {boolean}
   * @return {Promise<*>}
   */
  Progress.create = async function create({
    userId,
    fieldId,
    unitSetId,
    dimensionId,
    progress = 0,
    competencies = 0,
    complete = false,
  }) {
    log('create', {
      userId,
      fieldId,
      unitSetId,
      progress,
      competencies,
      complete,
    })
    const unitSets = []

    if (unitSetId && dimensionId) {
      const createdAt = new Date()
      unitSets.push({ _id: unitSetId, dimensionId, progress, competencies, complete, createdAt })
    }

    return getCollection(Progress.name).insertAsync({
      userId,
      fieldId,
      unitSets,
    })
  }

  Progress.update = async function update({
    userId,
    fieldId,
    unitSetId,
    dimensionId,
    progress = 0,
    competencies,
    complete,
  }) {
    log('update', {
      userId,
      fieldId,
      unitSetId,
      progress,
      competencies,
      complete,
    })
    const ProgressCollection = getCollection(Progress.name)
    const progressDoc = await ProgressCollection.findOneAsync({
      userId,
      fieldId,
    })

    if (!progressDoc) {
      return Progress.create({
        userId,
        fieldId,
        unitSetId,
        dimensionId,
        progress,
        competencies,
        complete,
      })
    }

    const index = progressDoc.unitSets.findIndex(
      (entry) => entry._id === unitSetId,
    )
    const timestamp = new Date()
    const entryExist = index > -1

    // if we found a unit set, then we only update the data at the given index
    // otherwise push a completely new entry to the unitSets list
    const updateDoc = entryExist
      ? {
          $inc: {
            [`unitSets.${index}.progress`]: progress,
            [`unitSets.${index}.competencies`]: competencies,
          },
          $set: {
            [`unitSets.${index}.complete`]: complete,
            [`unitSets.${index}.completedAt`]: complete ? timestamp : undefined,
            [`unitSets.${index}.updatedAt`]: timestamp,
          }
        }
      : {
          $push: {
            unitSets: { _id: unitSetId, dimensionId, competencies, complete, progress, createdAt: timestamp },
          },
        }
    log('unit set', { index, updateDoc })
    return ProgressCollection.updateAsync(progressDoc._id, updateDoc)
  }
})

Progress.methods = {}

Progress.methods.get = {
  name: 'progress.methods.get',
  schema: {
    fieldId: String,
  },
  run: onServerExec(
    () =>
      async function ({ fieldId }) {
        const { userId } = this
        return getCollection(Progress.name).findOneAsync({ userId, fieldId })
      },
  ),
}

Progress.methods.getAll = {
  name: 'progress.methods.getAll',
  schema: {
    dependencies: {
      type: Array,
      optional: true,
    },
    'dependencies.$': {
      type: Object,
      blackbox: true,
      optional: true,
    },
  },
  backend: true,
  run: onServerExec(() => {
    return async ({ dependencies } = {}) => {
      const options = { hint: { $natural: -1 } }
      const docs = await getCollection(Progress.name)
        .find({}, options)
        .fetchAsync()
      const data = { [Progress.name]: docs }

      await onDependencies()
        .output(data)
        .add(Field, 'fieldId')
        .run({ dependencies, docs })

      return data
    }
  }),
}

Progress.methods.my = {
  name: 'progress.methods.my',
  schema: {},
  run: onServerExec(() => {
    return async function () {
      const { userId } = this
      return getCollection(Progress.name).find({ userId }).fetchAsync()
    }
  }),
}
