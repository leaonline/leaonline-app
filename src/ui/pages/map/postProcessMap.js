import { Random } from 'meteor/random'
import { getLocalCollection } from '../../../api/utils/getLocalCollection'
import { translate } from '../../../api/i18n/translate'
import { Level } from '../../../contexts/content/Level'
import { Dimension } from '../../../contexts/content/Dimension'
import { ColorType } from '../../../contexts/types/ColorType'


export const postProcessMap = ({ entries, levels, dimensions, maxCompetencies, maxProgress }) => {
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

    // progress
    const progressPerc = Math.random() * 100
    data.progress = { max: entry.progress, current: 0, perc: progressPerc }

    if (isStage(entry)) {
      data.unitSets = entry.unitSets.map(unitSet => {
        const dimensionDoc = allDimensions[unitSet.dimension]
        const colorName = ColorType.byIndex(dimensionDoc.colorType).name
        dimensionDoc.color = colorName
        dimensionDoc.textColorClass = `text-${colorName}`
        dimensionDoc.bgColorClass = `bg-${colorName}`
        return {
          ...unitSet,
          dimension: dimensionDoc
        }
      })
    }

    processed.push(data)
  }

  return processed
}

const isStage = e => e.type === 'stage'
const isMilestone = e => e.type === 'milestone'