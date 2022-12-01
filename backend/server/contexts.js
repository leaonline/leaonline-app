import { createMethod } from '../infrastructure/factories/createMethod'
import { createCollection } from '../infrastructure/factories/createCollection'

import { Users } from '../contexts/users/Users'
import { Content } from '../contexts/content/Content'
import { ContentServer } from '../api/remotes/content/ContentServer'
import { MapData } from '../contexts/map/MapData'
import { ContextRegistry } from '../contexts/ContextRegistry'
import { SyncState } from '../contexts/sync/SyncState'
import { Progress } from '../contexts/progress/Progress'
import { Session } from '../contexts/session/Session'
import { Response } from '../contexts/response/Response'
import { Analytics } from '../contexts/analytics/Analytics'

const register = ctx => {
  if (!ContextRegistry.has(ctx.name)) {
    ContextRegistry.add(ctx.name, ctx)
  }
}

// create with collections
ContentServer.contexts().forEach(ctx => {
  createCollection(ctx)
  register(ctx)
})

// create collections for backend ctx
;[MapData, SyncState, Session, Response, Progress, Analytics].forEach(ctx => {
  createCollection(ctx)
  register(ctx)
})

// create methods for backend ctx
;[Users, Content, SyncState, Session, Response, Progress, Analytics].forEach(ctx => {
  const methods = Object.values(ctx.methods)
  methods.forEach(method => createMethod(method))
  register(ctx)
})
