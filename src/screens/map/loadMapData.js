import { callMeteor } from '../../meteor/call'
import { AppState } from '../../state/AppState'
import { Dimension } from '../../contexts/Dimension'
import { Log } from '../../infrastructure/Log'
import { loadProgressDoc } from './loadProgressData'

const methodName = 'content.methods.map'
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
    name: methodName,
    args: { fieldId },
    prepare: () => { if (withDebug) debug(methodName, 'start request') },
    receive: () => { if (withDebug) debug(methodName, 'received response') },
    success: () => { if (withDebug) debug(methodName, 'response valid') },
    failure: error => debug(methodName, 'response invalid', error.message)
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

  if (progressDoc) {
    // TODO count competencies for milestone, too!
    mapData.entries.forEach(entry => {
      if (entry.type === 'milestone') { return }

      let userStageProgress = 0

      entry.unitSets.forEach(unitSet => {
        const userUnitSet = progressDoc.unitSets[unitSet._id]
        if (!userUnitSet) { return }

        userStageProgress += userUnitSet.progress
        unitSet.userProgress = userUnitSet.progress
        unitSet.userCompetencies = userUnitSet.competencies
      })

      entry.userProgress = userStageProgress
    })
  }

  return mapData
}
