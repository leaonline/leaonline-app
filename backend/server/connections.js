import { Meteor } from 'meteor/meteor'
import { ContentServer } from '../api/remotes/content/ContentServer'

Meteor.startup(() => {
  const { sync } = Meteor.settings.remotes.content

  Meteor.defer(async () => {
    await ContentServer.init()

    const contexts = ContentServer.contexts().filter(ctx => !!sync[ctx.name])
    // array.forEach can't be used, because we want
    // read them in sequence and forEach does not do that
    for (const ctx of contexts) {
      await ContentServer.sync(ctx)
    }
  })
})

Meteor.onConnection(function (...args) {
  console.debug('client connected')
  console.debug(...args)
  // TODO: save/log client connection but keep sensitive data encrypted
})
