const SimpleSchema = require('simpl-schema')

const schema = x => new SimpleSchema(x)
const Integer = SimpleSchema.Integer

const settingsSchema = schema({
  isDevelopment: Boolean,
  isDeveloperRelease: Boolean,
  appToken: String,
  backend: schema({
    url: String,
    reachabilityUrl: String,
    maxTimeout: Integer,
    interval: Integer,
    methods: schema({
      defaultTimeout: Integer,
      sendError: String,
      users: schema({
        create: String,
        delete: String,
        restore: String
      }),
      content: schema({
        map: String,
        unit: String,
        session: String
      }),
      progress: schema({
        get: String
      }),
      session: schema({
        update: String
      }),
      response: schema({
        submit: String
      }),
      terms: schema({
        get: schema({
          name: String,
          args: schema({
            name: String
          })
        })
      }),
      dev: schema({
        get: String
      }),
      appraisal: schema({
        unitSet: String
      })
    })
  }),
  content: schema({
    url: String,
    replaceUrl: {
      type: String,
      optional: true
    }
  }),
  log: schema({
    level: Integer,
    target: schema({
      active: Boolean,
      transport: String,
      method: String,
      batchSize: Integer,
      level: Integer,
      separator: String
    })
  }),
  debug: schema({
    layoutBorders: Boolean,
    state: Boolean,
    sync: Boolean,
    home: Boolean,
    map: Boolean,
    unit: Boolean,
    tts: Boolean,
    accounts: Boolean,
    AppSession: Boolean
  })
})

module.exports = { settingsSchema }
