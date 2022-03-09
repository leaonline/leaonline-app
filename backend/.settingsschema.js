const SimpleSchema = require('simpl-schema')
const schema = def => new SimpleSchema(def)

const settingsSchema = schema({
  remotes: schema({
    content: schema({
      url: String
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
  public: schema({})
})

module.exports = function (settings) {
  settingsSchema.validate(settings)
}
