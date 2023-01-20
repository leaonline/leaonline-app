import { getCollection } from '../../api/utils/getCollection'

export const InteractionGraph = {
  name: 'interactionGraph',
  icon: 'project-diagram',
  representative: 'sessionId'
}

InteractionGraph.schema = {
  userId: {
    type: String,
    optional: true
  },
  sessionId: String,
  type: String,
  subtype: {
    type: String,
    optional: true
  },
  target: {
    type: String,
    optional: true
  },
  message: {
    type: String,
    optional: true
  },
  details: {
    type: Object,
    optional: true,
    blackbox: true
  },
  id: {
    type: String,
    optional: true
  },
  timestamp: Date
}

InteractionGraph.methods = {}

InteractionGraph.methods.send = {
  name: 'interactionGraph.methods.send',
  schema: {
    data: Array,
    'data.$': {
      type: Object,
      blackbox: true
    }
  },
  run: (function () {
    import { getUsersCollection } from '../../api/collections/getUsersCollection'
    import { createSchema } from '../../infrastructure/factories/createSchema'
    const schema = createSchema(InteractionGraph.schema)

    return function ({ data }) {
      const collection = getCollection(InteractionGraph.name)
      const { userId } = this
      const user = getUsersCollection().findOne(userId)

      // any data collected will only be saved if the user
      // is participant in our research program
      if (!user?.research) { return }

      data.forEach(doc => {
        schema.validate(doc)
        collection.insert({ userId, ...doc })
      })
    }
  })()
}
