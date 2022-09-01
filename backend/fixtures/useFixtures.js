import { EJSON } from 'meteor/ejson'
import fixtures from './fixtures.json'
import { getCollection } from '../api/utils/getCollection'
import { createLog } from '../infrastructure/log/createLog'
import { SyncState } from '../contexts/sync/SyncState'
import { Meteor } from 'meteor/meteor'
import { runRemap } from '../server/reamp'

const fixturesIsActive = Meteor.settings.useFixtures
const debug = createLog({ name: 'useFixtures', type: 'debug' })
const { remap } = Meteor.settings.remotes.content

/**
 * Inserts fixture docs for every relevant context into db, if "useFixtures" is set to true in the settings.
 * Otherwise, removes all fixture docs from DB.
 *
 * This is useful, in case you want to start the app without using a production data dump.
 */
export const useFixtures = () => {
  Object.entries(fixtures).forEach(([name, documents]) => {
    debug(name, 'docs:', documents.length)
    const collection = getCollection(name)

    documents.forEach(doc => {
      if (fixturesIsActive) {
        const upsert = collection.upsert({ _id: doc._id }, { $set: EJSON.parse(JSON.stringify(doc)) })
        debug('upsert', JSON.stringify(upsert))
      }

      else {
        const removed = collection.remove({ _id: doc._id })
        debug(name, 'removed:', removed)
      }
    })

    debug(name, 'update sync state')
    SyncState.update(name)
  })

  runRemap(remap)

  debug('all done')
}
