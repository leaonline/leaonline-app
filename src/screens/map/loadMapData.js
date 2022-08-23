import { callMeteor } from '../../meteor/call'
import { AppState } from '../../state/AppState'
import { Dimension } from '../../contexts/Dimension'
import { Log } from '../../infrastructure/Log'
import { loadProgressDoc } from './loadProgressData'
import { Config } from '../../env/Config'

const debug = Log.create('loadMapData', 'debug')

/**
 * Loads map data to build the map, that will be filled with user data
 * @return {Promise<*>}
 */
export const loadMapData = async (withDebug) => {
  const fieldDoc = await AppState.field()
  const fieldId = fieldDoc?._id

  if (!fieldId) {
    debug('no field selected, skip with null')
    return null
  }

  const mapData = await callMeteor({
    name: Config.methods.getMapData,
    args: { fieldId }
  })

  const hasData = !!mapData
  const hasDimensions = !!mapData.dimensions?.length
  const hasEntries = !!mapData.entries?.length
  const hasLevels = !!mapData.levels?.length

  debug(JSON.stringify({ hasData, hasDimensions, hasEntries, hasLevels }))

  // if neither the doc nor any entries wer sent -> skip
  if (!hasData || !hasDimensions || !hasEntries || !hasLevels) {
    debug(mapData)
    debug('data incomplete, skip with null')
    return null
  }

  mapData.dimensions = mapData.dimensions.map(dimensionId => {
    return Dimension.collection().findOne(dimensionId)
  })

  // attach the field name to the data so it can be displayed
  // on the navigation bar incl. a TTS button
  mapData.fieldName = fieldDoc.title

  // we load the progress doc here and immediately resolve
  // the values
  const progressDoc = await loadProgressDoc(fieldId)
  debug({ progressDoc })

  const levelsProgress = {}

  mapData.entries.forEach((entry, index) => {
    entry.key = `map-entry-${index}`

    if (entry.type === 'milestone') {
      entry.maxProgress = levelsProgress[entry.level].max
      entry.userProgress = levelsProgress[entry.level].user
      return
    }

    let userStageProgress = 0

    entry.unitSets.forEach(unitSet => {
      const userUnitSet = progressDoc
        ? progressDoc.unitSets[unitSet._id]
        : { progress: 0, competencies: 0 }

      userStageProgress += userUnitSet.progress
      unitSet.userProgress = userUnitSet.progress
      unitSet.userCompetencies = userUnitSet.competencies
    })

    entry.userProgress = userStageProgress

    if (!levelsProgress[entry.level]) {
      levelsProgress[entry.level] = { max: 0, user: 0 }
    }

    levelsProgress[entry.level].max += entry.progress
    levelsProgress[entry.level].user += userStageProgress
  })

  return mapData
}
