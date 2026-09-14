import { Meteor } from 'meteor/meteor'
import { ContentServer } from '../api/remotes/content/ContentServer'
import { SyncState } from '../contexts/sync/SyncState'
import { runRemap } from '../contexts/map/remap'
import { useFixtures } from '../fixtures/useFixtures'
import { ClientConnection } from '../contexts/connection/ClientConnection'

const { sync, remap } = Meteor.settings.remotes.content

Meteor.startup(async () => {
  await useFixtures()
  await ContentServer.init()

  // connection is set with a fixed timeout, since
  // we only need this connection once.
  // If the timeout is exceeded, we assume the content server
  // is not available for now and we skip sync.
  //
  // This might lead in not 100% up-to-date data
  // but waiting for the content server might lead
  // to the whole backend not being available to clients,
  // which is worse (unless we implement full offline support
  // for the mobile clients).
  if (!ContentServer.canSync()) {
    return
  }

  // contexts to sync are only queued,
  // if they are flagged in the settings.json
  const contexts = ContentServer.contexts().filter(ctx => !!sync[ctx.name])

  if (contexts.length > 0) {
    for (const ctx of contexts) {
      await ContentServer.sync(ctx)

      // let the clients know, that we have updated the data
      if (ctx.sync) {
        await SyncState.update(ctx.name)
      }
    }
  }
  await runRemap(remap)
})

Meteor.onConnection(ClientConnection.onConnected)
