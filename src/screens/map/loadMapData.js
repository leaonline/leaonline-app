import { callMeteor } from '../../meteor/call'
import { AppState } from '../../state/AppState'
import { Dimension } from '../../contexts/Dimension'
import { Log } from '../../infrastructure/Log'

const methodName = 'content.methods.map'
const debug = Log.create('loadMapData', 'debug')

/**
 * Loads map data to build the map, that will be filled with user data
 * @return {Promise<*>}
 */
export const loadMapData = async () => {
  const field = await AppState.field()
  const fieldId = field?._id

  if (!fieldId) {
    debug('no field selected, skip with null')
    return null
  }

  const mapData = await callMeteor({
    name: methodName,
    args: { fieldId },
    prepare: () => debug(methodName, 'start request'),
    receive: () => debug(methodName, 'received response'),
    success: () => debug(methodName, 'response valid'),
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

  return mapData
}
