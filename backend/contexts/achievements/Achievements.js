import { getCollection } from '../../api/utils/getCollection'
import { Field } from '../content/Field'
import { Dimension } from '../content/Dimension'
import { SyncState } from '../sync/SyncState'

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

Achievements.create = ({ dimensionId, fieldId }) => {
  const collection = getCollection(Achievements.name)
  const achievementId = collection.insert({ dimensionId, fieldId, maxProgress: 0, maxCompetencies: 0 })
  return collection.findOne(achievementId)
}

Achievements.update = ({ dimensionId, fieldId, maxProgress, maxCompetencies }) => {
  const collection = getCollection(Achievements.name)
  const query = { dimensionId, fieldId }
  let achievementDoc = collection.findOne(query)

  if (!achievementDoc) {
    achievementDoc = Achievements.create(query)
  }

  const updated = collection.update(achievementDoc._id, { $set: { maxCompetencies, maxProgress } })
  SyncState.update(Achievements.name)

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
  run: function ({ dependencies = {} } = {}) {
    const allAchievements = []
    const uniqueFields = new Set()
    const uniqueDimensions = new Set()
    const cursor = getCollection(Achievements.name)
      .find({}, { hint: { $natural: -1 } })
    allAchievements.length = cursor.count()

    cursor.forEach((doc, index) => {
      allAchievements[index] = doc
      uniqueDimensions.add(doc.dimensionId)
      uniqueFields.add(doc.fieldId)
    })

    const data = { [Achievements.name]: allAchievements }

    if (dependencies[Field.name]) {
      data[Field.name] = getCollection(Field.name)
        .find({ _id: { $in: [...uniqueFields] } })
        .fetch()
    }

    if (dependencies[Dimension.name]) {
      data[Dimension.name] = getCollection(Dimension.name)
        .find({ _id: { $in: [...uniqueDimensions] } })
        .fetch()
    }

    return data
  }
}

const uniqueIds = ids => [...new Set([...ids])]
