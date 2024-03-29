import { Dimension } from '../../../contexts/Dimension'
import { Field } from '../../../contexts/Field'
import { ColorTypeMap } from '../../../constants/ColorTypeMap'
import { callMeteor } from '../../../meteor/call'
import { Log } from '../../../infrastructure/Log'
import { Order } from '../../../contexts/Order'
import { byOrderedIds } from '../../../utils/array/byOrderedIds'
import { Achievements } from '../../../contexts/Achievements'

const debug = Log.create('')

/**
 * Loads all possible achievements from the server
 * and all user-progress data and computes the
 * current relative progress for each dimension
 * and the competencies for each field in this dimension.
 * @return {Promise<{overallProgress: number, fields: object[], dimensions: object[]}>}
 */
export const loadAchievementsData = async () => {
  const order = Order.collection().findOne()
  const fields = Field.collection().find().fetch()

  if (order) {
    fields.sort(byOrderedIds(order.fields))
  }

  const progressDocs = await callMeteor({
    name: 'progress.methods.my',
    args: {}
  })

  const achievementDocs = Achievements.collection().find().fetch()
  debug('loaded achievements', achievementDocs?.length)

  let globalMaxProgress = 0
  let globalUserProgress = 0

  achievementDocs.forEach(achievementDoc => {
    globalMaxProgress += achievementDoc.maxProgress
  })

  const dimensionDocs = Dimension.collection()
    .find()
    .fetch()

  if (order) {
    dimensionDocs.sort(byOrderedIds(order.dimensions))
  }

  const dimensions = dimensionDocs
    .map(dimensionDoc => {
      let maxProgress = 0
      const maxCompetencies = new Map()

      let userProgress = 0
      const userCompetencies = new Map()

      achievementDocs.forEach(doc => {
        if (doc.dimensionId === dimensionDoc._id) {
          maxProgress += doc.maxProgress
        }

        const currentMaxCompetencies = maxCompetencies.get(doc.fieldId) ?? 0
        maxCompetencies.set(doc.fieldId, currentMaxCompetencies + doc.maxCompetencies)
      })

      progressDocs.forEach(doc => {
        doc.unitSets.forEach(unitSetDoc => {
          if (unitSetDoc.dimensionId === dimensionDoc._id) {
            userProgress += unitSetDoc.progress
          }

          const currentCompetencies = userCompetencies.get(doc.fieldId) ?? 0
          userCompetencies.set(doc.fieldId, currentCompetencies + unitSetDoc.competencies)

          globalUserProgress += unitSetDoc.progress
        })
      })

      const copy = { ...dimensionDoc }
      copy.progress = 100 * (userProgress / maxProgress)
      copy.color = ColorTypeMap.get(dimensionDoc.colorType)
      copy.competencies = {}

      fields.forEach(fieldDoc => {
        const hasAchievements = Achievements.collection().find({
          fieldId: fieldDoc._id,
          dimensionId: dimensionDoc._id
        }).count() > 0

        if (hasAchievements) {
          const fieldMaxCompetencies = maxCompetencies.get(fieldDoc._id)
          const fieldUserCompetencies = userCompetencies.get(fieldDoc._id)

          copy.competencies[fieldDoc._id] = {
            title: fieldDoc.title,
            icon: dimensionDoc.icon,
            value: 100 * (fieldUserCompetencies / fieldMaxCompetencies)
          }
        }
      })

      return copy
    })

  const overallProgress = globalUserProgress / globalMaxProgress
  debug({ overallProgress, globalMaxProgress, globalUserProgress })

  return {
    dimensions,
    fields,
    overallProgress
  }
}
