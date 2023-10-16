import { getCollection } from '../../api/utils/getCollection'
import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { createLog } from '../../infrastructure/log/createLog'
import { Field } from '../content/Field'
import { createIdSet } from '../../api/utils/createIdSet'
import { onDependencies } from '../utils/onDependencies'

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
  useHistory: true
}
const log = createLog(Progress)

Progress.schema = {
  userId: {
    type: String
  },
  fieldId: {
    type: String,
    dependency: {
      collection: Field.name,
      field: Field.representative
    }
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
  'unitSets.$.dimensionId': {
    type: String,
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

Progress.create = ({ userId, fieldId, unitSetId, dimensionId, progress, competencies, complete }) => {
  log('create', { userId, fieldId, unitSetId, progress, competencies, complete })
  const unitSets = [{ _id: unitSetId, dimensionId, progress, competencies, complete }]
  return getCollection(Progress.name).insert({ userId, fieldId, unitSets })
}

Progress.update = ({ userId, fieldId, unitSetId, dimensionId, progress, competencies, complete }) => {
  log('update', { userId, fieldId, unitSetId, progress, competencies, complete })
  const ProgressCollection = getCollection(Progress.name)
  const progressDoc = ProgressCollection.findOne({ userId, fieldId })

  if (!progressDoc) {
    return Progress.create({ userId, fieldId, unitSetId, dimensionId, progress, competencies, complete })
  }

  const unitSetDoc = { _id: unitSetId, dimensionId, progress, competencies, complete }
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

Progress.methods.getAll = {
  name: 'progress.methods.getAll',
  schema: {
    dependencies: {
      type: Array,
      optional: true
    },
    'dependencies.$': {
      type: Object,
      blackbox: true,
      optional: true
    }
  },
  backend: true,
  run: function ({ dependencies } = {}) {
    const options = { hint: { $natural: -1 } }
    const docs = getCollection(Progress.name).find({}, options).fetch()
    const data = { [Progress.name]: docs }

    onDependencies()
      .output(data)
      .add(Field, 'fieldId')
      .run({ dependencies, docs })

    return data
  }
}

Progress.methods.my = {
  name: 'progress.methods.my',
  schema: {},
  run: function () {
    const { userId } = this
    return getCollection(Progress.name).find({ userId }).fetch()
  }
}
