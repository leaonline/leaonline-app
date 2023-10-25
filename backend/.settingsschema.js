const SimpleSchema = require('simpl-schema')
const schema = def => new SimpleSchema(def)

const settingsSchema = schema({
  app: schema({
    name: String,
    token: String
  }),
  isStaging: Boolean,
  defaultLang: String,
  oauth: schema({
    clientId: String,
    secret: String,
    dialogUrl: String,
    accessTokenUrl: String,
    authorizeUrl: String,
    identityUrl: String,
    redirectUrl: String
  }),
  useFixtures: Boolean,
  remotes: schema({
    content: schema({
      url: String,
      jwt: schema({
        key: String,
        sub: String
      }),
      sync: schema({
        "field": Boolean,
        "unit": Boolean,
        "unitSet": Boolean,
        "dimension": Boolean,
        "level": Boolean,
        "testCycle": Boolean,
        "mapIcons": Boolean,
        "feedback": Boolean,
        "order": Boolean,
        "legal": Boolean,
        "achievements": Boolean
      }),
      remap: schema({
        active: Boolean,
        dryRun: Boolean,
        dimensions: schema({
          order: [String]
        })
      })
    })
  }),
  restore: schema({
    codes: schema({
      numberOfCodes: SimpleSchema.Integer,
      length: SimpleSchema.Integer,
      uppercase: Boolean,
      forbidden: schema({
        source: String,
        flags: {
          type: String,
          optional: true
        }
      }),
      maxRetries: SimpleSchema.Integer
    })
  }),
  crypto: schema({
    key: {
      type: String,
      min: 32
    },
    algorithm: String,
    outputFormat: String
  }),
  log: schema({
    level: SimpleSchema.Integer
  }),
  email: schema({
    notify: {
      type: Array,
      optional: true
    },
    'notify.$': SimpleSchema.RegEx.Email,
    replyTo: {
      type: SimpleSchema.RegEx.Email,
      optional: true
    },
    from: {
      type: SimpleSchema.RegEx.Email,
      optional: true
    }
  }),
  public: schema({})
})

module.exports = function (settings) {
  settingsSchema.validate(settings)
}
