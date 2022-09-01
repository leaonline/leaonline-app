import { getCollection } from '../api/utils/getCollection'
import { Field } from '../contexts/content/Field'
import { MapData } from '../contexts/map/MapData'
import { SyncState } from '../contexts/sync/SyncState'

/**
 * This invokes the MapData to recreate itself from given DB documents.
 * Also updates the sync state that is used in the app to fetch new updated data.
 *
 * @param active {boolean} determines, whether the remap should be executed
 * @param dryRun {boolean} determines, whether the remap result should be saved as new Map data
 */
export const runRemap = ({ active, dryRun }) => {
  if (active) {
    // after sync we need to recompute the map data
    const fields = getCollection(Field.name).find()

    if (fields.count() > 0) {
      // create map data for each field
      for (const field of fields) {
        MapData.create({ field: field._id, dryRun })
      }
    }

    // let the clients know, that we have updated the data
    if (!dryRun) {
      SyncState.update(MapData.name)
    }
  }
}
