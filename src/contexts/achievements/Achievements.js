import { getCollection } from '../../api/utils/getCollection'
import { Field } from '../content/Field'
import { Dimension } from '../content/Dimension'
import { SyncState } from '../sync/SyncState'
import { onDependencies } from '../utils/onDependencies'

/**
 * Contains documents of all possible field <-> dimension
 * combinations with the maximum achievable progress and
 * competencies.
 */
export const Achievements = {
  name: 'achievements',
  label: 'achievements.title',
  icon: 'trophy',
  sync: true
}

Achievements.schema = {
  dimensionId: {
    type: String,
    dependency: {
      collection: Dimension.name,
      field: Dimension.representative
    }
  },
  fieldId: {
    type: String,
    dependency: {
      collection: Field.name,
      field: Field.representative
    }
  },
  maxProgress: {
    type: Number
  },
  maxCompetencies: {
    type: Number
  }
}

Achievements.create = async function create ({ dimensionId, fieldId }) {
  const collection = getCollection(Achievements.name)
  const achievementId = await collection.insertAsync({ dimensionId, fieldId, maxProgress: 0, maxCompetencies: 0 })
  return collection.findOneAsync(achievementId)
}

Achievements.update = async function update ({ dimensionId, fieldId, maxProgress, maxCompetencies }) {
  const collection = getCollection(Achievements.name)
  const query = { dimensionId, fieldId }
  let achievementDoc = await collection.findOneAsync(query)

  if (!achievementDoc) {
    achievementDoc = await Achievements.create(query)
  }

  const updated = await collection.updateAsync(achievementDoc._id, { $set: { maxCompetencies, maxProgress } })
  await SyncState.update(Achievements.name)

  return updated
}

Achievements.methods = {}

Achievements.methods.getAll = {
  name: 'achievements.methods.getAll',
  backend: true,
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
  run: async function ({ dependencies = {} } = {}) {
    const docs = await getCollection(Achievements.name).find({}, { hint: { $natural: -1 } }).fetchAsync()
    const data = { [Achievements.name]: docs }

    await onDependencies()
      .output(data)
      .add(Field, 'fieldId')
      .add(Dimension, 'dimensionId')
      .run({ docs, dependencies })

    return data
  }
}
