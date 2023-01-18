import { createMethod } from '../infrastructure/factories/createMethod'
import { createCollection } from '../infrastructure/factories/createCollection'
import { Meteor } from 'meteor/meteor'
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
import { ServiceRegistry } from '../api/remotes/ServiceRegistry'
import { Legal } from '../contexts/legal/Legal'
import { rateLimitMethods } from '../infrastructure/factories/rateLimit'
import { getServiceLang } from '../api/i18n/getLang'
import { InteractionGraph } from '../contexts/analytics/InteractionGraph'

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
;[MapData, SyncState, Session, Response, Progress, Analytics, Legal, InteractionGraph].forEach(ctx => {
  createCollection(ctx)
  register(ctx)
})

// create methods for backend ctx
;[MapData, Users, Content, SyncState, Session, Response, Progress, Analytics, Legal, InteractionGraph].forEach(ctx => {
  const methods = Object.values(ctx.methods)
  methods.forEach(method => createMethod(method))
  register(ctx)
})

ServiceRegistry.init({
  icon: 'mobile',
  label: 'apps.app.title',
  description: 'apps.app.description'
})

const { defaultLang } = Meteor.settings
ServiceRegistry.addLang(defaultLang, getServiceLang(defaultLang))
// ServiceRegistry.register(Analytics)
ServiceRegistry.register(Session)
ServiceRegistry.register(MapData)
ServiceRegistry.register(Progress)
ServiceRegistry.register(Users)
ServiceRegistry.register(Legal)

const methods = Object.values(ServiceRegistry.methods)
methods.forEach(method => createMethod(method))
rateLimitMethods(methods)
