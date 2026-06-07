import { Random } from 'meteor/random'
import { getLocalCollection } from '../../../api/utils/getLocalCollection'
import { translate } from '../../../api/i18n/translate'
import { Level } from '../../../contexts/content/Level'
import { Dimension } from '../../../contexts/content/Dimension'
import { ColorType } from '../../../contexts/types/ColorType'


export const postProcessMap = ({ entries, levels, dimensions, maxCompetencies, maxProgress }, progressDoc) => {
  const progressMap = {}
  for (const progressEntry of (progressDoc?.unitSets ?? [])) {
    progressMap[progressEntry._id] = progressEntry
  }
console.debug(progressMap)
  const LevelsCollection = getLocalCollection(Level.name)
  const DimensionsCollection = getLocalCollection(Dimension.name)
  const allLevels = levels.map(levelId => {
    return LevelsCollection.findOne(levelId)
  })
  const allDimensions = dimensions.map(doc => {
    return  {
      ...doc,
      ...DimensionsCollection.findOne(doc._id)
    }
  })

  const processed = []

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const data = { id: Random.id(6), type: entry.type }

    data.title = translate('map.entry.title', { value: i + 1 })

    // level
    const levelDoc = allLevels[entry.level]
    data.level = { _id: levelDoc._id, title: levelDoc.title }

    let stageProgress = 0

    if (isStage(entry)) {
      data.unitSets = []
      for (const unitSet of entry.unitSets) {
        const dimensionDoc = allDimensions[unitSet.dimension]
        const colorName = ColorType.byIndex(dimensionDoc.colorType).name
        dimensionDoc.color = colorName
        dimensionDoc.textColorClass = `text-${colorName}`
        dimensionDoc.bgColorClass = `bg-${colorName}`
        const unitSetProgress = progressMap[unitSet._id]
        const currentProgress = unitSetProgress ? unitSetProgress.progress : 0
        stageProgress += currentProgress

        data.unitSets.push({
          ...unitSet,
          dimension: dimensionDoc,
          progress: {
            current: currentProgress,
            max: unitSet.progress,
            perc: currentProgress / unitSet.progress
          }
        })
      }
    }

    // progress
    const progressPerc = stageProgress / entry.progress
    data.progress = { max: entry.progress, current: stageProgress, perc: progressPerc }

    processed.push(data)
  }

  return processed
}

const isStage = e => e.type === 'stage'
const isMilestone = e => e.type === 'milestone'