import { callMeteor } from '../../meteor/call'
import { AppState } from '../../state/AppState'
import { Dimension } from '../../contexts/Dimension'
import { Log } from '../../infrastructure/Log'
import { loadProgressDoc } from './loadProgressData'
import { Config } from '../../env/Config'

const debug = Config.debug.map
  ? Log.create('loadMapData', 'debug')
  : () => {}

/**
 * Loads map data to build the map, that will be filled with user data
 * @return {Promise<*>}
 */
export const loadMapData = async () => {
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
  const hasDimensions = hasData && !!mapData.dimensions?.length
  const hasEntries = hasData && !!mapData.entries?.length
  const hasLevels = hasData && !!mapData.levels?.length

  debug(JSON.stringify({ hasData, hasDimensions, hasEntries, hasLevels }))

  // if neither the doc nor any entries wer sent -> skip
  if (!hasData || !hasDimensions || !hasEntries || !hasLevels) {
    debug('data incomplete, skip with null')
    debug({ mapData })
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
  let progressDoc = await loadProgressDoc(fieldId)

  if (!progressDoc) {
    progressDoc = {
      unitSets: []
    }
  }

  const levelsProgress = {}

  mapData.entries.forEach((entry, index) => {
    entry.key = `map-entry-${index}`

    // a milestone contains a summary of the progress of the stages
    // where maxProgress is the maximum achievable progress and
    // where userProgress is the current user's progress (defaults to zero)
    if (entry.type === 'milestone') {
      entry.maxProgress = levelsProgress[entry.level].max
      entry.userProgress = levelsProgress[entry.level].user || 0
      return
    }

    // set defaults
    entry.userProgress = entry.userProgress || 0
    entry.progress = entry.progress || 0

    let userStageProgress = 0

    entry.unitSets.forEach(unitSet => {
      const userUnitSet = progressDoc.unitSets[unitSet._id] ?? { progress: 0, competencies: 0 }
      const usersUnitSetProgress = userUnitSet.progress || 0
      const usersUnitSetCompetencies = userUnitSet.competencies || 0

      userStageProgress += usersUnitSetProgress
      unitSet.userProgress = usersUnitSetProgress
      unitSet.userCompetencies = usersUnitSetCompetencies
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
