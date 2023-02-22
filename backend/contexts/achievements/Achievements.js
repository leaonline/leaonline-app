import { Field } from '../content/Field'
import { Dimension } from '../content/Dimension'
import { MapData } from '../map/MapData'
import { getCollection } from '../../api/utils/getCollection'

export const Achievements = {
  name: 'achievements',
  label: 'achievements.title',
  icon: 'trophy'
}

Achievements.schema = {
  userId: {
    type: String
  },
  dimensionId: {
    type: String,
    dependency: {
      collection: Dimension.name,
      field: Dimension.representative
    }
  },
  fields: {
    type: Array
  },
  'fields.$': {
    type: Object
  },
  'fields.$.fieldId': {
    type: String,
    dependency: {
      collection: Field.name,
      field: Field.representative
    }
  },
  'fields.$.maxProgress': {
    type: Number,
    defaultValue: 0
  },
  'fields.$.maxCompetencies': {
    type: Number,
    defaultValue: 0
  },
  'fields.$.progress': {
    type: Number,
    defaultValue: 0
  },
  'fields.$.competencies': {
    type: Number,
    defaultValue: 0
  }
}

Achievements.create = ({ userId, dimensionId, fieldId }) => {
  const fields = []
  const achievementId = getCollection(Achievements.name).insert({ userId, dimensionId, fieldId, fields })
  return getCollection(Achievements.name).findOne(achievementId)
}

Achievements.getFieldData = ({ fieldId }) => {
  const mapDoc = MapData.get({ fieldId })

  return {
    fieldId,
    maxProgress: mapDoc.maxProgress,
    maxCompetencies: mapDoc.maxCompetencies,
    progress: 0,
    competencies: 0
  }
}

Achievements.update = ({ userId, fieldId, dimensionId, progress, competencies }) => {
  const AchievementsCollection = getCollection(Achievements.name)
  let achievementsDoc = AchievementsCollection.findOne({ userId, dimensionId, fieldId })

  if (!achievementsDoc) {
    achievementsDoc = Achievements.create({ userId, fieldId, dimensionId })
  }

  const updateDoc = {}
  const fieldIndex = achievementsDoc.fields.findIndex(entry => entry.fieldId === fieldId)

  // if there is no entry for this field yet
  // we need to create a new one that also contains
  // the maxProgress and maxCompetencies
  if (fieldIndex === -1) {
    const field = Achievements.getFieldData({ fieldId })
    field.progress = progress
    field.competencies = competencies

    updateDoc.$push = { fields: field }
  }

  // otherwise we update the entry at the given index
  else {
    updateDoc.$inc = {
      [`fields.${fieldIndex}.progress`]: progress,
      [`fields.${fieldIndex}.competencies`]: competencies
    }
  }

  return AchievementsCollection.update(achievementsDoc._id, updateDoc)
}
