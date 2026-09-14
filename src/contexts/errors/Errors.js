import { onServerExec } from '../../utils/archUtils'

export const Errors = {
  name: 'errors',
  label: 'errors.title',
  icon: 'exclamation-triangle'
}

Errors.schema = {
  name: {
    type: String,
    optional: true,
    defaultValue: 'error'
  },

  type: {
    type: String,
    optional: true,
    defaultValue: 'Native.Error'
  },

  message: {
    type: String,
    optional: true
  },

  details: {
    type: String,
    optional: true
  },

  hash: {
    type: String
  },

  count: {
    type: Number,
    optional: true
  },

  stack: {
    type: String,
    optional: true
  },

  createdBy: {
    type: String
  },

  createdAt: {
    type: Date
  },

  template: {
    type: String,
    optional: true
  },

  isServer: {
    type: Boolean,
    optional: true
  },
  isClient: {
    type: Boolean,
    optional: true
  },
  method: {
    type: String,
    optional: true
  },
  publication: {
    type: String,
    optional: true
  },
  endpoint: {
    type: String,
    optional: true
  },
  isSystem: Boolean,

  browser: {
    type: String,
    optional: true
  },
  // these are added by the server-side method, no matter what
  // has been defined in "createdAt" field or being sent by client
  userId: {
    type: String,
    optional: true
  },
  code: {
    type: String,
    optional: true
  }
}

Errors.publications = {}
Errors.routes = {}
Errors.methods = {}

Errors.methods.create = {
  name: 'errors.methods.create',
  schema: Errors.schema,
  isPublic: true,
  run: onServerExec(function () {
    import { persistError } from './api/persistError'
    import { Meteor } from 'meteor/meteor'

    return async function (errorDoc) {
      const { userId } = this
      errorDoc.userId = userId

      if (userId && !errorDoc.code) {
        const user = await Meteor.users.findOneAsync(userId)
        errorDoc.code = user?.username
      }

      return persistError(errorDoc)
    }
  })
}
