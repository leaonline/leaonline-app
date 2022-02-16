import { createMethod } from '../infrastructure/factories/createMethod'
import { createCollection } from '../infrastructure/factories/createCollection'

import { Users } from '../contexts/Users'
import { Content } from '../contexts/Content'
import { ContentServer } from '../api/remotes/content/ContentServer'

// create with collections
ContentServer.contexts().forEach(ctx => {
  createCollection(ctx)
})

;[Users, Content].forEach(context => {
  const methods = Object.values(context.methods)
  methods.forEach(method => createMethod(method))
})
