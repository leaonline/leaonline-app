import { callMeteor } from '../../meteor/call'
import { Dimension } from '../../contexts/Dimension'
import { Log } from '../../infrastructure/Log'
import { loadProgressDoc } from './loadProgressData'
import { Config } from '../../env/Config'
import { MapIcons } from './MapIcons'
import nextFrame from 'next-frame'

const useDebug = Config.debug.map
const debug = useDebug
  ? Log.create('loadMapData', 'debug')
  : () => {}

// we use a simple RAM cache for the map data
// so it's only loaded once per session but we never
// persist it in order to obtain new changes from the server
const mapCache = new Map()

/**
 * Loads map data to build the map, that will be filled with user data and supplemented with
 * elements to be displayed on the map. The processing acts by the following pseudo-code:
 *
 * 1. for the current field get map data from cache or load from server
 * 2. if data is incomplete, return null
 * 3. resolve dimension ids to their respective documents
 * 4. attach the field name to the data
 * 5. if loadUserData is not null
 *
 *
 *
 * @return {Promise<*>}
 */
export const loadMapData = async ({ fieldDoc, loadUserData, onUserDataLoaded }) => {
  debug('load for', fieldDoc?.title, { loadUserData })
  const fieldId = fieldDoc?._id
  if (!fieldId) {
    debug('no field selected, skip with null')
    return null
  }

  // 1. for the current field get map data from cache
  // or load from server, field is required at this step
  const mapData = mapCache.has(fieldId)
    ? mapCache.get(fieldId)
    : await callMeteor({
      name: Config.methods.getMapData,
      args: { fieldId }
    })

  // 2. if data is incomplete return null
  // this requires dimensions, levels and entries
  // to be existent on mapData
  const hasData = !!mapData
  const hasDimensions = hasData && !!mapData.dimensions?.length
  const hasEntries = hasData && !!mapData.entries?.length
  const hasLevels = hasData && !!mapData.levels?.length

  // if neither the doc nor any entries exist -> exist with null
  if (!hasData || !hasDimensions || !hasEntries || !hasLevels) {
    debug('data incomplete, skip with null')
    debug({ hasData, hasDimensions, hasEntries, hasLevels })
    debug({ mapData })
    return null
  }

  await nextFrame()

  // 3. resolve dimension ids to their respective documents
  // this is required, since we aim to keep the data footprint
  // low and thus only send the ids of the dimensions.
  // We assume, that dimensions have been loaded at the sync
  // step during startup.
  // TODO: check if we can extract tjhis into a an async function
  // that loads dimensions at runtime (once, then from cache) to
  // avoid this (error-prone) assumption and avoid this loading
  // step during startup
  if (!mapData.dimensionsResolved) {
    for (let i = 0; i < mapData.dimensions.length; i++) {
      const dimensionId = mapData.dimensions[i]
      mapData.dimensions[i] = Dimension.collection().findOne(dimensionId)
    }
    mapData.dimensionsResolved = true
  }

  // 4. attach the field name to the data so it can be displayed
  // on the navigation bar incl. a TTS button
  mapData.fieldName = fieldDoc.title

  // 5. if loadUserData is not null we also load
  // all progress data and enrich the respective entry types with
  // progress data; thus we can display the current progress right
  // on the map.
  // these two data structures are separate as they are separately
  // updated and while user progress can update often, the map data
  // needs to be loaded only once.
  // Finally, reset loadUserData until session updates this value again
  if (loadUserData) {
    await addUserData(mapData, fieldId)
    await onUserDataLoaded()
  }

  // 6. enrich entries with view-only properties, like
  // - position (left, center, right)
  // - start, finish elements
  if (!mapData.viewElementsAdded) {
    await addViewProperties(mapData)
    mapData.viewElementsAdded = true
  }

  mapCache.set(fieldId, mapData)
  console.debug('mapdata complete')
  return mapData
}

const addUserData = async (mapData, fieldId) => {
  let progressDoc = await loadProgressDoc(fieldId)
  debug('add user data', !!progressDoc)

  if (!progressDoc) {
    progressDoc = {
      unitSets: []
    }
  }

  const levelsProgress = {}
  mapData.progressIndex = 0

  const updateEntry = (entry, index) => {
    if (['finish', 'start'].includes(entry.type)) {
      return
    }

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

    // in order to display the most recent item on the list
    // we need to track the "highest" index of a stage
    // that contains progress
    if (userStageProgress) {
      mapData.progressIndex = index
    }

    if (!levelsProgress[entry.level]) {
      levelsProgress[entry.level] = { max: 0, user: 0 }
    }

    levelsProgress[entry.level].max += entry.progress
    levelsProgress[entry.level].user += userStageProgress
  }

  for (let index = 0; index < mapData.entries.length; index++) {
    updateEntry(mapData.entries[index], index)
  }
}

const addViewProperties = async (mapData) => {
  let count = 1

  // 6.1. ensure every stage entry contains a label with the index (counting from 1)
  for (const entry of mapData.entries) {
    if (typeof entry.label !== 'number' && entry.type === 'stage') {
      entry.label = count++
    }
  }

  // 6.2. ensure first and last elements are start and finish
  const first = mapData.entries[0]
  const last = mapData.entries[mapData.entries.length - 1]

  if (first.type === 'stage') {
    mapData.entries.unshift({ type: 'start' })
  }

  if (first.type === 'milestone') {
    first.type = 'start'
  }

  if (last.type === 'stage') {
    mapData.entries.push({ type: 'finish' })
  }

  if (last.type === 'milestone') {
    last.type = 'finish'
  }

  // 6.3. add view position
  // 6.4. add unique keys to every entry (react-specific)

  let useLeft = false
  let index = 0
  for (const entry of mapData.entries) {
    const nextEntry = mapData.entries[index + 1]
    const last = useLeft ? 'right' : 'left'
    const current = useLeft ? 'left' : 'right'

    let next

    if (nextEntry) {
      next = nextEntry && nextEntry.type === 'stage'
        ? last
        : 'center'
    }

    // stages are always either left or right aligned
    if (entry.type === 'stage') {
      const viewPosition = {
        left: null,
        current: null,
        right: null,
        icon: -1
      }

      // a connector for the current stage is only present, if the next stage
      // is either left or right align
      const connector = next !== 'center'
        ? `${current}2${next}`
        : null

      if (next !== 'center') {
        viewPosition.icon = MapIcons.getIncrementalIconIndex()
      }

      viewPosition.current = current
      viewPosition.left = useLeft
        ? null
        : connector
      viewPosition.right = useLeft
        ? connector
        : null

      entry.viewPosition = viewPosition
      useLeft = !useLeft
    }

    // all other elements are always centered
    else {
      const current = 'center'
      const left = last === 'left'
        ? 'right2left-down'
        : 'right2left-up'
      const right = last === 'right'
        ? 'left2right-down'
        : 'left2right-up'
      entry.viewPosition = { current, left, right }
    }

    entry.entryKey = `map-entry-${index++}`
  }

  // on first and last element replace
  // unused connectors with 'fill'
  mapData.entries[0].viewPosition.left = 'fill'

  const len = mapData.entries.length
  const theLast = mapData.entries[len - 1]
  const preLast = mapData.entries[len - 2]

  if (preLast && preLast.viewPosition.current === 'left') {
    theLast.viewPosition.right = 'fill'
  }
  if (preLast && preLast.viewPosition.current === 'right') {
    theLast.viewPosition.left = 'fill'
  }
}
