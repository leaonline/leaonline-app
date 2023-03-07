import SimpleSchema from 'simpl-schema'

const schema = x => new SimpleSchema(x)
const Integer = SimpleSchema.Integer

export const settingsSchema = schema({
  isDevelopment: Boolean,
  isDeveloperRelease: Boolean,
  backend: schema({
    url: String,
    maxTimeout: Integer,
    interval: Integer,
    methods: schema({
      defaultTimeout: Integer,
      users: schema({
        create: String,
        delete: String
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
      })
    })
  }),
  content: schema({
    url: String,
    replaceUrl: String
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
  }),
  dimensions: schema({
    order: Array,
    'order.$': String
  })
})