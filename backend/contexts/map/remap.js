import { getCollection } from '../../api/utils/getCollection'
import { Field } from '../content/Field'
import { MapData } from './MapData'
import { SyncState } from '../sync/SyncState'
import { Achievements } from '../achievements/Achievements'

/**
 * This invokes the MapData to recreate itself from given DB documents.
 * Also updates the sync state that is used in the app to fetch new updated data.
 *
 * @param active {boolean} determines, whether the remap should be executed
 * @param dryRun {boolean} determines, whether the remap result should be saved as new Map data
 * @param dimensions {object} determines dimensions order
 * @param dimensions.order {string[]}
 * @return {boolean}
 */
export const runRemap = ({ active, dryRun, dimensions } = {}) => {
  if (active !== true) {
    return false
  }

  // after sync we need to recompute the map data
  // for all fields we have received or updated
  const fields = getCollection(Field.name).find()

  if (fields.count() === 0) {
    return false
  }

  // create map data for each field
  for (const field of fields) {
    const fieldId = field._id
    MapData.create({ field: fieldId, dryRun, dimensionsOrder: dimensions.order })

    const mapDoc = MapData.get({ field: fieldId })
    mapDoc.dimensions.forEach(entry => {
      const dimensionId = entry._id
      const { maxProgress, maxCompetencies } = entry

      if (maxCompetencies > 0 && maxProgress > 0) {
        Achievements.update({ dimensionId, fieldId, maxProgress, maxCompetencies })
      }
    })
  }

  // let the clients know, that we have updated the data
  if (dryRun === false) {
    SyncState.update(MapData.name)
  }

  return true
}
