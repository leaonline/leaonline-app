import { Meteor } from 'meteor/meteor'
import { ContentServer } from '../api/remotes/content/ContentServer'
import { SyncState } from '../contexts/sync/SyncState'
import { createLog } from '../infrastructure/log/createLog'
import { runRemap } from './remap'
import { useFixtures } from '../fixtures/useFixtures'

const { sync, remap } = Meteor.settings.remotes.content

Meteor.startup(async () => {
  useFixtures()
  await ContentServer.init()
  const contexts = ContentServer.contexts().filter(ctx => !!sync[ctx.name])

  if (contexts.length > 0) {
    // array.forEach can't be used, because we want
    // read them in sequence and forEach does not do that
    for (const ctx of contexts) {
      await ContentServer.sync(ctx)

      // let the clients know, that we have updated the data
      if (ctx.sync) {
        SyncState.update(ctx.name)
      }
    }
  }
  runRemap(remap)
})

const log = createLog({ name: 'connection' })

Meteor.onConnection(function (connection) {
  log('client connected', JSON.stringify(connection))
  // TODO: save/log client connection but keep sensitive data encrypted
})
