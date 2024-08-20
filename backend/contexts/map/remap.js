import { getCollection } from '../../api/utils/getCollection'
import { Field } from '../content/Field'
import { MapData } from './MapData'
import { SyncState } from '../sync/SyncState'
import { Achievements } from '../achievements/Achievements'
import { forEachAsync } from '../../infrastructure/async/forEachAsync'

/**
 * This invokes the MapData to recreate itself from given DB documents.
 * Also updates the sync state that is used in the app to fetch new updated data.
 *
 * @async
 * @param active {boolean?} determines, whether the remap should be executed
 * @param dryRun {boolean?} determines, whether the remap result should be saved as new Map data
 * @param dimensions {object?} determines dimensions order
 * @param dimensions.order {string[]?}
 * @return {Promise<boolean>}
 */
export const runRemap = async ({ active, dryRun, dimensions } = {}) => {
  if (active !== true) {
    return false
  }

  const FieldsCollection = getCollection(Field.name)

  if (await FieldsCollection.countDocuments({}) === 0) {
    return false
  }

  // after sync we need to recompute the map data
  // for all fields we have received or updated
  const fields = await FieldsCollection.find().fetchAsync()


  // create map data for each field
  for (const field of fields) {
    const fieldId = field._id
    await MapData.create({ field: fieldId, dryRun, dimensionsOrder: dimensions.order })

    const mapDoc = await MapData.get({ field: fieldId })

    // for every dimension we get max possible
    // progress and competencies and forward them
    // to the Achievements to update
    await forEachAsync(mapDoc.dimensions, async entry => {
      const dimensionId = entry._id
      const { maxProgress, maxCompetencies } = entry

      if (maxCompetencies > 0 && maxProgress > 0) {
        await Achievements.update({ dimensionId, fieldId, maxProgress, maxCompetencies })
      }
    })
  }

  // let the clients know, that we have updated the data
  if (dryRun === false) {
    await SyncState.update(MapData.name)
  }

  return true
}
