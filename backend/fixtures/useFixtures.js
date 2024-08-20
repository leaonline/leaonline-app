import fixtures from './fixtures.js'
import { getCollection } from '../api/utils/getCollection'
import { createLog } from '../infrastructure/log/createLog'
import { SyncState } from '../contexts/sync/SyncState'
import { Meteor } from 'meteor/meteor'
import { ContextRegistry } from '../contexts/ContextRegistry'
import { forEachAsync } from '../infrastructure/async/forEachAsync'

const fixturesIsActive = Meteor.settings.useFixtures
const debug = createLog({ name: 'useFixtures', type: 'debug' })

/**
 * Inserts fixture docs for every relevant context into db, if "useFixtures" is set to true in the settings.
 * Otherwise, removes all fixture docs from DB.
 *
 * This is useful, in case you want to start the app without using a production data dump.
 *
 * @async
 * @category startup
 * @module useFixtures
 * @return {undefined} nothing to return
 */
export const useFixtures = async () => {
  const entries = Object.entries(fixtures)
  await forEachAsync(entries,  async ([name, documents]) => {
    debug(name, 'docs:', documents.length)
    const collection = getCollection(name)

    await forEachAsync(documents, async doc => {
      if (fixturesIsActive) {
        const upsert = await collection.upsertAsync({ _id: doc._id }, { $set: doc })
        debug('upsert', JSON.stringify(upsert))
      }

      else {
        const removed = await collection.removeAsync({ _id: doc._id })
        debug(name, 'removed:', removed)
      }
    })

    const ctx = ContextRegistry.get(name)

    if (ctx?.sync) {
      debug(name, 'update sync state')
      await SyncState.update(name)
    }
  })

  debug('all done')
}
